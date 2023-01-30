import { useState, createContext, PropsWithChildren, useCallback, useEffect } from "react";
import storage from "../../utils/storage";
export const GlobalStateContext = createContext([{}, (): null => null]);

const GlobalStateProvider = function (props: PropsWithChildren<any>) {
  const {getStorage, setStorage} = storage("brewPlanner");
  const initialState = getStorage("globalState") || {};
  const [globalState, setState] = useState(initialState);
  const setGlobalState = (newState: any) => {
    setState(newState);
  }
  const memoizedSetState = useCallback(setGlobalState, []);

  useEffect(() => {
    // when globalState is updated, save globalState to localStorage
    setStorage("globalState", globalState)
  }, [globalState]);

  return (
    <GlobalStateContext.Provider 
      value={
        [ globalState, memoizedSetState ]
      }
    >
      {props.children}
    </GlobalStateContext.Provider>
  );
};

export default GlobalStateProvider;
