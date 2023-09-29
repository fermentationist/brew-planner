import "dotenv/config";
import {initializeApp as initializeClientApp} from "firebase/app";
import {getAuth, signInWithEmailAndPassword, signOut, setPersistence, inMemoryPersistence} from "firebase/auth";
export {createUser, deleteUser, updateUser, getUser, getAllUsers} from "../src/services/user.js";

const clientApp = initializeClientApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_API_ID,
});

const clientAuth = getAuth(clientApp);
setPersistence(clientAuth, inMemoryPersistence);

export const getIDToken = async (email, password) => {
  await signOut(clientAuth);
  return signInWithEmailAndPassword(clientAuth, email, password);
}
