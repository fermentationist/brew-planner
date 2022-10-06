import {initializeApp as initializeClientApp} from "firebase/app";
import {getAuth, signInWithEmailAndPassword, signOut, setPersistence, inMemoryPersistence} from "firebase/auth";
export {createUser, deleteUser, updateUser, getUser, getAllUsers} from "../src/services/user.js";

const clientApp = initializeClientApp({
  apiKey: "AIzaSyBnsIopHa8DPfHyOwOVuB9tL4uNhjCe-xU",
  authDomain: "fermentationist-brew-planner.firebaseapp.com",
  projectId: "fermentationist-brew-planner",
  storageBucket: "fermentationist-brew-planner.appspot.com",
  messagingSenderId: "398501432243",
  appId: "1:398501432243:web:a100413dd760fa5e5419c6"
});

const clientAuth = getAuth(clientApp);
setPersistence(clientAuth, inMemoryPersistence);

export const getIDToken = async (email, password) => {
  await signOut(clientAuth);
  return signInWithEmailAndPassword(clientAuth, email, password);
}
