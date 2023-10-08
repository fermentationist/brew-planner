import { createContext, PropsWithChildren, useEffect, useReducer } from "react";
import useDeeperMemo from "../../hooks/useDeeperMemo";
import globalReducer from "./globalReducer";
import storage from "../../utils/storage";

export const GlobalStateContext = createContext([{}, (): null => null]);

const GlobalStateProvider = function (props: PropsWithChildren<any>) {
  const {getStorage, setStorage} = storage("brewPlanner");
  const initialState = getStorage("globalState") || {};
  const deepMemoize = useDeeperMemo();

  const [globalState, dispatch] = useReducer(globalReducer, initialState);

  useEffect(() => {
    // when globalState is updated, save globalState to localStorage
    setStorage("globalState", globalState);
  }, [globalState, setStorage]);

  return (
    <GlobalStateContext.Provider 
      value={deepMemoize([ globalState, dispatch ], "globalState")}
    >
      {props.children}
    </GlobalStateContext.Provider>
  );
};

export default GlobalStateProvider;


