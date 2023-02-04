import { useEffect, useState, createContext, useCallback } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { AuthObject, ChildProps } from "../../types";
import firebaseConfig from "../../config/firebaseConfig";
import storage from "../../utils/storage";
import useDeeperMemo from "../../hooks/useDeeperMemo";
const { setStorage, getStorage } = storage("brewPlanner");

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);

export interface IAuthContext {
  auth: AuthObject;
  setAuth: (newState: any) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  sendPasswordResetEmail: (email: string) => void;
}

export const AuthContext = createContext<IAuthContext>({
  auth: {} as AuthObject,
  setAuth: null,
  login: null,
  logout: null,
  sendPasswordResetEmail: null,
});

const AuthProvider = function (props: ChildProps) {
  const initialState = getStorage("authState") || { loaded: false };
  const [authState, setAuthState] = useState(initialState as AuthObject);
  const [tokenRefresh, setTokenRefresh] = useState(false);
  const deepMemoize = useDeeperMemo();

  const setAuth = useCallback((newState: AuthObject | ((prevState: any) => any)) => {
    setAuthState(newState);
  }, []);

  useEffect(() => {
    // when authState is updated, save it to localStorage
    console.log("authState updated:", authState)
    setStorage("authState", (authState));
  }, [authState]);

  const resetAuth = useCallback(() => {
    console.log("resetting auth");
    setTokenRefresh(true);
    setAuth({
      firebaseUser: null,
      user: null,
      accessToken: null,
      currentBrewery: null,
      loaded: true,
      tokenExpiration: null,
    });
  }, [setAuth]);

  useEffect(() => {
    const tokenExpired =
      tokenRefresh ||
      (authState.tokenExpiration && Date.now() > authState.tokenExpiration)
        ? true
        : false;
    if (tokenExpired) {
      console.log("token expired");
      // logout();
      firebaseAuth.updateCurrentUser(authState.firebaseUser);
    } else {
      console.log("token not expired");
    }
    // was previously using firebaseAuth.onAuthStateChanged
    const removeListener = firebaseAuth.onIdTokenChanged((authUser: any) => {
      if (!authUser) {
        resetAuth();
      } else {
        authUser.getIdTokenResult(tokenExpired).then((result: any) => {
          setTokenRefresh(false);
          setAuth(prevState => ({
            ...prevState,
            firebaseUser: authUser,
            user: {
              uid: authUser.uid,
              email: authUser.email,
              displayName: authUser.displayName,
              role: result.claims.role,
              breweries: result.claims.breweries || [],
            },
            accessToken: authUser.accessToken,
            currentBrewery:
              prevState.currentBrewery || result.claims.breweries[0],
            tokenExpiration: new Date(result.expirationTime).getTime(),
            loaded: true,
          }));
        });
      }
    });
    return () => {
      // cleanup
      console.log("removing auth state listener");
      removeListener();
    };
  }, [authState.currentBrewery, authState.tokenExpiration, tokenRefresh]);

  const login = useCallback(async (email: string, password: string) => {
    console.log("login called.");
    const credentials: any = await signInWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    ).catch((err) => {
      console.log(`Error logging in user ${email}`);
      console.error(err);
    });
    return credentials?.user?.accessToken || false;
  }, []);

  const logout = useCallback(async () => {
    console.log("logging out user...");
    resetAuth();
    await signOut(firebaseAuth);
  }, [resetAuth]);

  const passwordReset = useCallback((email: string) => {
    return sendPasswordResetEmail(firebaseAuth, email);
  }, []);

  const contextValue = {
    auth: authState,
    setAuth,
    login,
    logout,
    sendPasswordResetEmail: passwordReset,
  };

  return (
    <AuthContext.Provider value={deepMemoize(contextValue, "authContext")}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
