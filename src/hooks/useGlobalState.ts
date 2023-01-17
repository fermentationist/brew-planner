import { useContext } from "react";
import { GlobalStateContext } from "../context/GlobalStateProvider";

const useGlobalState = (): any => {
  console.log("useContext:", useContext);
  return useContext(GlobalStateContext);
}
export default useGlobalState;
