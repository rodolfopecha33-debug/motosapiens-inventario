// src/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC8lxiaPtgBD3aaK2TjgO3-yBTEhkwVNK8",
  authDomain: "motosapiens-c6bed.firebaseapp.com",
  projectId: "motosapiens-c6bed",
  storageBucket: "motosapiens-c6bed.firebasestorage.app",
  messagingSenderId: "837812965880",
  appId: "1:837812965880:web:9426b8ddbbb9baec6dc60d",
  measurementId: "G-XVTDJ79Y7E"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export default app;
