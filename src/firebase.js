// Inicialización de Firebase. Las claves vienen de .env (ver .env.example).
import {initializeApp} from "firebase/app";
import {initializeFirestore,persistentLocalCache,persistentMultipleTabManager} from "firebase/firestore";
const app=initializeApp({
 apiKey:import.meta.env.VITE_FIREBASE_API_KEY,
 authDomain:import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
 projectId:import.meta.env.VITE_FIREBASE_PROJECT_ID,
 appId:import.meta.env.VITE_FIREBASE_APP_ID});
// Caché offline: si la wifi del salón falla, la app sigue andando y sincroniza al volver.
export const db=initializeFirestore(app,{localCache:persistentLocalCache({tabManager:persistentMultipleTabManager()})});
