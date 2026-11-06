import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBfiEzQbaWBWD9XJ9ZwpH5M1FIBrGaXUEQ",
  authDomain: "fir-flutter-codelab-ba7af.firebaseapp.com",
  databaseURL: "https://fir-flutter-codelab-ba7af-default-rtdb.firebaseio.com",
  projectId: "fir-flutter-codelab-ba7af",
  storageBucket: "fir-flutter-codelab-ba7af.firebasestorage.app",
  messagingSenderId: "948199110927",
  appId: "1:948199110927:web:c5aa33dfe170d3a92c267a",
  measurementId: "G-BN8XTH1TZT"
};

const app = initializeApp(firebaseConfig);

export const database = getDatabase(app);
export const auth = getAuth(app);