import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
//GetAuth Method is used to Configure our app to use Firebase Authentication
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyB8nmk0SmB4JtdPP3fBVnZk8YqvVtwLc3I",
  authDomain: "bremencityar-16a5d.firebaseapp.com",
  projectId: "bremencityar-16a5d",
  storageBucket: "bremencityar-16a5d.appspot.com",
  messagingSenderId: "120922141950",
  appId: "1:120922141950:web:b8035f8a8d60705bd061af",
};
export const prefix_storage = firebaseConfig.storageBucket;
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
