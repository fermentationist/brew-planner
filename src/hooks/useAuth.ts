import { useContext, Dispatch, SetStateAction } from "react";
import { AuthContext } from "../context/AuthProvider";
import { AuthObject, ReducerAction } from "../types";
import useDeeperMemo from "./useDeeperMemo";

export interface UseAuthObject {
  auth: [
    AuthObject,
    Dispatch<SetStateAction<ReducerAction>>
  ];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  sendPasswordResetEmail: (email: string) => void;
}

const useAuth = (): UseAuthObject => {
  const deepMemoize = useDeeperMemo();
  const output = useContext(AuthContext);
  return deepMemoize(output, "auth");
};

export default useAuth;
