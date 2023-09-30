import { useState, createContext, useCallback } from "react";
import { APIError, ChildProps } from "../../types";

export interface AlertState {
  isOpen: boolean;
  message: string;
  title: string;
  confirmCallback?: (response: any) => any;
  closeCallback?: (x: boolean) => void;
  promptForInput?: boolean;
  child?: JSX.Element;
  showCloseButton?: boolean;
}

export interface CallAlertParams {
  message?: string;
  title?: string;
  confirmCallback?: (response: any) => any;
  closeCallback?: (x: boolean) => void;
  promptForInput?: boolean;
  child?: JSX.Element;
  showCloseButton?: boolean;
}

export type CallAlertArgs = CallAlertParams | string;

const initialState: AlertState = {
  isOpen: false,
  message: null,
  title: null,
  confirmCallback: null,
  promptForInput: false,
  child: null,
  showCloseButton: true,
};

export const AlertStateContext = createContext({
  alertState: initialState,
  setAlertState: (_newState: any) => {
    console.error("call to setAlertState failed.");
  },
  callAlert: (args: CallAlertArgs) => {
    if (typeof args === "string") {
      alert(args);
    } else {
      alert(args.message);
    }
  },
  callAlertProm: (args: CallAlertArgs) => {
    return new Promise(resolve => {
      const message = typeof args === "string" ? args : args.message;
      alert(message);
      return resolve(true);
    });
  },
  resetAlertState: () => {
    console.error("call to resetAlertState failed.");
  },
  alertError: (error: APIError) => {
    console.error(error);
    alert(error.message);
  },
  alertErrorProm: (error: APIError) => {
    return new Promise(resolve => {
      console.error(error);
      alert(error.message);
      return resolve(true);
    });
  }
});

const AlertStateProvider = function ({children}:{children: ChildProps}) {
  const [alertState, setAlertState] = useState(initialState);

  const callAlert = (args: CallAlertArgs) => {
    let message, title, confirmCallback, closeCallback, promptForInput, child, showCloseButton;
    if (typeof args === "string") {
      message = args;
    } else {
      ({
        message,
        title,
        confirmCallback,
        closeCallback,
        promptForInput,
        child,
        showCloseButton
      } = args);
    }
    showCloseButton = showCloseButton ?? true;
    setAlertState({
      isOpen: true,
      message: typeof message === "string" ? message : JSON.stringify(message),
      title: title || null,
      confirmCallback: confirmCallback || null,
      closeCallback: closeCallback || null,
      promptForInput: promptForInput || false,
      child,
      showCloseButton
    });
  };

  const callAlertProm = (args: CallAlertArgs) => {
    return new Promise((resolve) => {
      const passedArgs = typeof args === "string" ? { message: args } : args;
      const alertArgs = {
        ...passedArgs,
        closeCallback: () => {
          if (passedArgs.closeCallback) {
            return resolve(passedArgs.closeCallback(true));
          }
          return resolve(true);
        }
      };
      return callAlert(alertArgs);
    });
  };

  const resetAlertState = () => {
    setAlertState(initialState);
  };

  const alertError = (error: APIError) => {
    console.error(error);
    callAlert({ message: error.message, title: error.name });
  };
  const alertErrorProm = (error: APIError) => {
    return new Promise(resolve => {
      console.error(error);
      callAlert({
        message: error.message,
        title: error.name,
        closeCallback: () => {
          return resolve(true);
        }
      });
    });
  };
  const memoizedSetAlertState = useCallback(setAlertState, []);
  const memoizedCallAlert = useCallback(callAlert, []);
  const memoizedCallAlertProm = useCallback(callAlertProm, []);
  const memoizedResetAlertState = useCallback(resetAlertState, []);
  const memoizedAlertError = useCallback(alertError, []);
  const memoizedAlertErrorProm = useCallback(alertErrorProm, []);

  return (
    <AlertStateContext.Provider
      value={{
        alertState,
        setAlertState: memoizedSetAlertState,
        callAlert: memoizedCallAlert,
        callAlertProm: memoizedCallAlertProm,
        resetAlertState: memoizedResetAlertState,
        alertError: memoizedAlertError,
        alertErrorProm: memoizedAlertErrorProm
      }}
    >
      {children}
    </AlertStateContext.Provider>
  );
};

export default AlertStateProvider;
