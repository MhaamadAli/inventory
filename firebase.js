// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
const firestore = getFirestore(app);

export { firestore }