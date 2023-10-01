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
import useTriggeredEffect from "../../hooks/useTriggeredEffect";
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

const AuthProvider = ({ children }: { children: ChildProps }) => {
  const NULL_AUTH_STATE = {
    loaded: true,
    firebaseUser: null,
    user: null,
    accessToken: null,
    currentBrewery: null,
    tokenExpiration: null,
  } as AuthObject;
  const initialState = getStorage("authState") || { loaded: false };
  const [authState, setAuthState] = useState(initialState as AuthObject);
  const deepMemoize = useDeeperMemo();

  const setAuth = useCallback(
    (newState: AuthObject | ((prevState: any) => any)) => {
      setAuthState(newState);
    },
    [setAuthState]
  );

  useTriggeredEffect(() => {
    // when authState is updated, save it to localStorage
    console.log("saving authState to localStorage:", authState);
    setStorage("authState", authState);
  }, [stringifyObjectWithFunctions(authState)]); 

  const resetAuth = useCallback(() => {
    console.log("resetting auth");
    setAuth(NULL_AUTH_STATE);
    setStorage("authState", NULL_AUTH_STATE);
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
    console.log("useEffect adding onIdTokenChanged listener...");
    const removeListener = firebaseAuth.onIdTokenChanged((authUser: any) => {
      console.log("authUser in onIdTokenChanged:", authUser);
      if (!authUser) {
        resetAuth();
      } else {
        authUser
          .getIdTokenResult()
          .then((result: any) => {
            setAuth((prevState) => { 
              console.log("result.claims.breweries:", result.claims.breweries);
              return {
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
              };
            });
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
    const newAuthState = {
      ...authState,
      loaded: true,
      accessToken: credentials?.user?.accessToken || null,
    }
    setAuthState(newAuthState);
    setStorage("authState", newAuthState);
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
