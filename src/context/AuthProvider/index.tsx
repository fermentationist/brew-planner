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
import { stringifyObjectWithFunctions } from "../../utils/helpers";
const { setStorage, getStorage } = storage("brewPlanner");

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);

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

const AuthProvider = ({children}:{children: ChildProps}) => {
  const initialState = getStorage("authState") || { loaded: false };
  const [authState, setAuthState] = useState(initialState as AuthObject);
  // const [tokenRefresh, setTokenRefresh] = useState(false);
  const deepMemoize = useDeeperMemo();

  const setAuth = useCallback((newState: AuthObject | ((prevState: any) => any)) => {
    setAuthState(newState);
  }, []);

  useEffect(() => {
    // when authState is updated, save it to localStorage
    console.log("saving authState to localStorage:", authState)
    setStorage("authState", (authState));
  }, [stringifyObjectWithFunctions(authState)]); // stringifying dependency (authState) so that useEffect will only be called when it actually changes

  const resetAuth = useCallback(() => {
    console.log("resetting auth");
    // setTokenRefresh(true);
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
    // const tokenExpired =
    //   // tokenRefresh ||
    //   (authState.tokenExpiration && Date.now() >= authState.tokenExpiration)
    //     ? true
    //     : false;
    // if (tokenExpired) {
    //   // logout();
    //   firebaseAuth.updateCurrentUser(authState.firebaseUser);
    // } 
    // was previously using firebaseAuth.onAuthStateChanged
    console.log("useEffect adding onIdTokenChanged listener...")
    const removeListener = firebaseAuth.onIdTokenChanged((authUser: any) => {
      console.log("authUser in onIdTokenChanged:", authUser)
      if (!authUser) {
        resetAuth();
      } else {
        authUser.getIdTokenResult(
          // tokenExpired
          ).then((result: any) => {
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
  }, [resetAuth, setAuth]);

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
    setAuthState(prevState => {
      return {
        ...prevState,
        loaded: false,
        accessToken: credentials?.user?.accessToken || null
      }
    })
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
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
