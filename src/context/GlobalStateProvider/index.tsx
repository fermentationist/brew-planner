import { useState, createContext, PropsWithChildren, useCallback, useEffect } from "react";
import useDeeperMemo from "../../hooks/useDeeperMemo";
import storage from "../../utils/storage";
export const GlobalStateContext = createContext([{}, (): null => null]);

const GlobalStateProvider = function (props: PropsWithChildren<any>) {
  const {getStorage, setStorage} = storage("brewPlanner");
  const initialState = getStorage("globalState") || {};
  const [globalState, setState] = useState(initialState);
  const deepMemoize = useDeeperMemo();

  const setGlobalState = useCallback((newState: any) => {
    setState(newState);
  }, []);

  useEffect(() => {
    // when globalState is updated, save globalState to localStorage
    console.log("globalState updated:", globalState)
    setStorage("globalState", globalState);
  }, [globalState, setStorage]);

  return (
    <GlobalStateContext.Provider 
      value={deepMemoize([ globalState, setGlobalState ], "globalState")}
    >
      {props.children}
    </GlobalStateContext.Provider>
  );
};

export default GlobalStateProvider;


