import { useContext } from "react";
import { GlobalStateContext } from "../context/GlobalStateProvider";

const useGlobalState = (): any => {
  return useContext(GlobalStateContext);
}
export default useGlobalState;
