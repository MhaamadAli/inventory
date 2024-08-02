// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCGyDtpVdp2aiWrHZBN-tnBqSTmMbResnI",
  authDomain: "inventory-management-55e0a.firebaseapp.com",
  projectId: "inventory-management-55e0a",
  storageBucket: "inventory-management-55e0a.appspot.com",
  messagingSenderId: "15384666955",
  appId: "1:15384666955:web:a47837202f2b3d41ccbece",
  measurementId: "G-NJSS57ED4G",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, provider);
export const signOutUser = () => signOut(auth);