import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCom_PK5vOzLiMmg8G7eEXj2EPiV3l0FcI",
  authDomain: "mjayict-58fae.firebaseapp.com",
  projectId: "mjayict-58fae",
  storageBucket: "mjayict-58fae.firebasestorage.app",
  messagingSenderId: "8704826105",
  appId: "1:8704826105:web:e8986220631f93d11da028"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
