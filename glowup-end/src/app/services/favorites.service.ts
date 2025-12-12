import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {

  private favoritesSubject = new BehaviorSubject<string[]>([]);
  favorites$ = this.favoritesSubject.asObservable();

  constructor(private auth: AuthService, private firestore: Firestore) {
    this.loadFavorites();
  }

  async loadFavorites() {
    let favorites: string[] = [];
    if (this.auth.isLoggedIn()) {
      const uid = this.auth.currentUser!.uid;
      const snap = await getDoc(doc(this.firestore, "users", uid));
      favorites = snap.exists() ? (snap.data() as any)['favorites'] || [] : [];
    } else {
      const local = localStorage.getItem('favorites');
      favorites = local ? JSON.parse(local) : [];
    }
    this.favoritesSubject.next(favorites);
    return favorites;
  }

  async toggleFavorite(itemId: string, status: boolean) {
    let favorites = await this.loadFavorites();

    if (status) {
      if (!favorites.includes(itemId)) favorites.push(itemId);
    } else {
      favorites = favorites.filter(id => id !== itemId);
    }

    if (this.auth.isLoggedIn()) {
      const uid = this.auth.currentUser!.uid;
      await setDoc(doc(this.firestore, "users", uid), { favorites }, { merge: true });
    } else {
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }

    this.favoritesSubject.next(favorites);
  }

  async mergeLocalWithServer(uid: string) {
    const local = localStorage.getItem('favorites');
    if (!local) return;

    const localFav = JSON.parse(local);
    const snap = await getDoc(doc(this.firestore, "users", uid));
    const serverFav = snap.exists() ? (snap.data() as any)['favorites'] || [] : [];
    const merged = Array.from(new Set([...serverFav, ...localFav]));
    await setDoc(doc(this.firestore, "users", uid), { favorites: merged }, { merge: true });
    localStorage.removeItem('favorites');

    this.favoritesSubject.next(merged);
  }
}
