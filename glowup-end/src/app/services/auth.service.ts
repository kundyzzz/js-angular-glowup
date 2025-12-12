import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User
} from '@angular/fire/auth';

import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private storage: Storage
  ) {
    this.auth.onAuthStateChanged((user) => {
      this.userSubject.next(user);
    });
  }

  signup(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth);
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  async updateProfilePhoto(file: File) {
    const user = this.currentUser;
    if (!user) throw new Error("Not authenticated");

    const filePath = `profile_photos/${user.uid}.jpg`;
    const storageRef = ref(this.storage, filePath);

    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    await setDoc(doc(this.firestore, "users", user.uid), {
      photoURL: url
    }, { merge: true });

    return url;
  }

  async getProfilePhoto(uid: string): Promise<string | null> {
    const snap = await getDoc(doc(this.firestore, "users", uid));
    if (snap.exists()) {
      return snap.get("photoURL") || null;
    }
    return null;
  }
}
