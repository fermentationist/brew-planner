import { useContext } from "react";
import { GlobalStateContext } from "../context/GlobalStateProvider";

const useGlobalState = (): any => {
  console.log("useGlobalState called.")
  return useContext(GlobalStateContext);
}
export default useGlobalState;
