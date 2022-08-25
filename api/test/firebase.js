import {initializeApp as initializeClientApp} from "firebase/app";
import {getAuth, signInWithEmailAndPassword, signOut, setPersistence, inMemoryPersistence} from "firebase/auth";
export {createUser, deleteUser, updateUser, getUser, getAllUsers} from "../src/services/user.js";

const clientApp = initializeClientApp({
  apiKey: "AIzaSyCyEZO5bTPEI_yRguNegf01FYmrwpzcePY",
  authDomain: "spirit-hub-plus-test.firebaseapp.com",
  projectId: "spirit-hub-plus-test",
  storageBucket: "spirit-hub-plus-test.appspot.com",
  messagingSenderId: "405422551429",
  appId: "1:405422551429:web:87360901e95f6c0c8d54ec"
});

const clientAuth = getAuth(clientApp);
setPersistence(clientAuth, inMemoryPersistence);

export const getIDToken = async (email, password) => {
  await signOut(clientAuth);
  return signInWithEmailAndPassword(clientAuth, email, password);
}
