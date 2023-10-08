import {
  useEffect,
  useState,
  createContext,
  useCallback,
  useReducer,
} from "react";
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
import APIRequest from "../../utils/APIRequest";
import { authReducer } from "./authReducer";
const { setStorage, getStorage } = storage("brewPlanner");

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);

export interface IAuthContext {
  auth: [store: AuthObject, dispatch: (newState: any) => void];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  sendPasswordResetEmail: (email: string) => void;
}

export const AuthContext = createContext<IAuthContext>({
  auth: [{} as AuthObject, null],
  login: null,
  logout: null,
  sendPasswordResetEmail: null,
});

const AuthProvider = ({ children }: { children: ChildProps }) => {
  const initialState = getStorage("authState") || { loaded: false };
  const [validBreweryUuids, setValidBreweryUuids] = useState([] as string[]);
  const [authState, dispatch] = useReducer(authReducer, initialState);
  const deepMemoize = useDeeperMemo();

  // useEffect to get brewery uuids, which are used to filter out defunct breweries from brewery uuids in user's Firebase claims
  useEffect(() => {
    // cannot use useAPI hook because this component is used outside of APIProvider
    const breweryUuidsRequest = new APIRequest({
      url: "/breweries/uuids",
      method: "GET",
    });

    breweryUuidsRequest.dispatch().then((response: any) => {
      setValidBreweryUuids(response?.data?.uuids ?? []);
    }).catch((err: any) => {
      console.error(err);
      setValidBreweryUuids([]);
    });
    // cleanup
    return () => {
      breweryUuidsRequest.abort();
    };
  }, []);

  const resetAuth = useCallback(() => {
    const NULL_AUTH_STATE = {
      loaded: true,
      firebaseUser: null,
      user: null,
      accessToken: null,
      currentBrewery: null,
      tokenExpiration: null,
    } as AuthObject;
    console.log("resetting auth");
    dispatch({ type: "OVERWRITE_AUTH_STATE", payload: { ...NULL_AUTH_STATE } }); // overwrite auth state with null auth state
    setStorage("authState", NULL_AUTH_STATE);
  }, [dispatch]);

  const filterOutDefunctBreweryUuids = (breweryUuids: any[]) => {
    console.log("validBreweryUuids:", validBreweryUuids);
    console.log("user breweryUuids:", breweryUuids);
    const filteredBreweries = breweryUuids.filter((uuid) => {
      return validBreweryUuids.includes(uuid);
    });
    return filteredBreweries;
  };

  useEffect(() => {
    // was previously using firebaseAuth.onAuthStateChanged
    console.log("useEffect adding onIdTokenChanged listener...");
    const removeListener = firebaseAuth.onIdTokenChanged((authUser: any) => {
      console.log("authUser in onIdTokenChanged:", authUser);
      if (!authUser) {
        resetAuth();
      } else {
        authUser.getIdTokenResult().then((result: any) => {
          const userBreweries = filterOutDefunctBreweryUuids(
            result.claims.breweries
          );
          let newCurrentBrewery =
            (authState.currentBrewery &&
            userBreweries.includes(authState.currentBrewery))
              ? authState.currentBrewery
              : userBreweries[0];
          if (result.claims.role === "admin") {
            newCurrentBrewery = newCurrentBrewery ?? validBreweryUuids[0];
          }
          const newAuthState = {
            ...authState,
            firebaseUser: authUser,
            user: {
              uid: authUser.uid,
              email: authUser.email,
              displayName: authUser.displayName,
              role: result.claims.role,
              breweries: userBreweries,
            },
            accessToken: authUser.accessToken,
            currentBrewery: newCurrentBrewery,
            tokenExpiration: new Date(result.expirationTime).getTime(),
            loaded: true,
          };
          console.log("newCurrentBrewery:", newAuthState.currentBrewery);
          dispatch({ type: "OVERWRITE_AUTH_STATE", payload: newAuthState });
          setStorage("authState", newAuthState);
        });
      }
    });
    return () => {
      // cleanup
      console.log("removing auth state listener");
      removeListener();
    };
  // adding authState.currentBrewery to dependency array causes infinite loop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetAuth, dispatch, authState.currentBrewery, validBreweryUuids, authState.accessToken]);

  useEffect(() => {
    console.log("authState in useEffect:", authState);
  }, [authState]);

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
    };
    dispatch({ type: "OVERWRITE_AUTH_STATE", payload: newAuthState });
    setStorage("authState", newAuthState);
    const token = await credentials?.user?.accessToken;
    if (token) {
      window.location.reload();
      return token;
    }
    return false;
  }, [authState, dispatch]);

  const logout = useCallback(async () => {
    console.log("logging out user...");
    resetAuth();
    await signOut(firebaseAuth);
  }, [resetAuth]);

  const passwordReset = useCallback((email: string) => {
    return sendPasswordResetEmail(firebaseAuth, email);
  }, []);

  const contextValue = {
    auth: [authState, dispatch],
    dispatch,
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
