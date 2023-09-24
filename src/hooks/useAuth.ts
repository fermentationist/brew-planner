import { useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthProvider";
import { AuthObject } from "../types";
import { opError } from "../utils/errors";
import useDeeperMemo from "./useDeeperMemo";

export interface UseAuthObject {
  auth: AuthObject;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  changeBrewery: (newBrewery: string) => void;
  sendPasswordResetEmail: (email: string) => void;
}

const useAuth = (): UseAuthObject => {
  const { auth, setAuth, login, logout, sendPasswordResetEmail } =
    useContext(AuthContext);
  const deepMemoize = useDeeperMemo();

  const changeBrewery = useCallback(
    (newBrewery: string) => {
      console.log("change brewery to ", newBrewery)
      if (
        auth?.user?.role === "admin" ||
        auth?.user?.breweries?.includes(newBrewery)
      ) {
        setAuth((prevState: AuthObject) => ({
          ...prevState,
          currentBrewery: newBrewery,
        }));
      } else {
        throw opError("Client is not authorized to access this brewery", {
          name: "unauthorized",
        });
      }
    },
    [auth, setAuth]
  );

  const output = {
    auth,
    login,
    logout,
    changeBrewery,
    sendPasswordResetEmail,
  };
  return deepMemoize(output, "auth");
};

export default useAuth;
