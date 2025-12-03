import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ------------------------------------------------------------------
// IMPORTANTE: REEMPLAZA ESTO CON LA CONFIGURACIÓN DE TU PROYECTO
// OBTIENELA EN: https://console.firebase.google.com/
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyB9Any5aFCxK8Df-y5pXfxAkKW3BwkKoIg",
  authDomain: "mototracket.firebaseapp.com",
  projectId: "mototracket",
  storageBucket: "mototracket.firebasestorage.app",
  messagingSenderId: "257453932088",
  appId: "1:257453932088:web:46b6fc48703b878a8170cd",
  measurementId: "G-QZVH1FTV37"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
