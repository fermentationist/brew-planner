import { useContext, useMemo, useCallback } from "react";
import { AuthContext } from "../context/AuthProvider";
import { AuthObject } from "../types";
import { opError } from "../utils/errors";

export interface UseAuthObject {
  auth: AuthObject;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  changeBrewery: (newBrewery: string) => void;
  sendPasswordResetEmail: (email: string) => void;
}

const useAuth = (): UseAuthObject => {
  const { auth, setAuth, login, logout, sendPasswordResetEmail } = useContext(AuthContext);
  const changeBrewery = (newBrewery: string) => {
    if (auth?.user?.role === "admin" || auth?.user?.breweries?.includes(newBrewery)) {
      setAuth({
        ...auth,
        currentBrewery: newBrewery
      });
    } else {
      throw opError("Client is not authorized to access this brewery", {name: "unauthorized"});
    }
  };

  return {
    auth,
    login,
    logout,
    changeBrewery: useCallback(changeBrewery, []),
    sendPasswordResetEmail
  };
};

export default useAuth;
 