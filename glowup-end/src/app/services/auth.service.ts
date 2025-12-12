import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  Auth
} from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private app: FirebaseApp;
  private auth!: Auth;
  private firestore = getFirestore();
  private storage = getStorage();

  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor() {
    this.app = initializeApp(environment.firebaseConfig);
    this.auth = getAuth(this.app);
    onAuthStateChanged(this.auth, (user) => {
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

  get currentUser() {
    return this.userSubject.value;
  }

  async updateProfilePhoto(file: File) {
    if (!this.currentUser) throw new Error('User not logged in');

    const storageRef = ref(this.storage, `profile_pictures/${this.currentUser.uid}`);
    await uploadBytes(storageRef, file);

    const photoURL = await getDownloadURL(storageRef);

    const userDocRef = doc(this.firestore, 'users', this.currentUser.uid);
    await setDoc(userDocRef, { photoURL }, { merge: true });

    return photoURL;
  }

  async getProfilePhoto(uid: string) {
    const userDocRef = doc(this.firestore, 'users', uid);
    const docSnap = await getDoc(userDocRef);
    return docSnap.exists() ? (docSnap.data() as any).photoURL : null;
  }
}
