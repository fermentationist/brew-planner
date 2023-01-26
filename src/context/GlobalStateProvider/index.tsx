import { useState, createContext, PropsWithChildren, useCallback } from "react";
import storage from "../../utils/storage";
export const GlobalStateContext = createContext([{}, (): null => null]);

const GlobalStateProvider = function (props: PropsWithChildren<any>) {
  const {getStorage, setStorage} = storage("brewPlanner");
  const initialState = getStorage("globalState") || {};
  const [globalState, setState] = useState(initialState);
  const setGlobalState = (newState: any) => {
    setStorage("globalState", newState);
    setState(newState);
  }
  const memoizedSetState = useCallback(setGlobalState, []);
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
