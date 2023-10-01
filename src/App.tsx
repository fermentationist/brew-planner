import ClientRouter from "./components/ClientRouter";
import { ThemeProvider } from "@mui/material/styles";
import {lightTheme, darkTheme} from "./config/themes";
import useGlobalState from "./hooks/useGlobalState";
import Alerts from "./components/Alerts";
import AlertStateProvider from "./context/AlertStateProvider";
import APIProvider from "./context/APIProvider";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import queryClientConfig from "./config/queryClientConfig";
import { memo } from "react";
const queryClient = new QueryClient(queryClientConfig);


const App = () => {
  const [globalState] = useGlobalState();
  return (
    <div className="App" style={{position: "absolute"}}>
      <ThemeProvider theme={globalState?.theme === "dark" ? darkTheme : lightTheme}>
        <QueryClientProvider client={queryClient}>
          <APIProvider>
            <AlertStateProvider>
              <ClientRouter />
              <Alerts />
            </AlertStateProvider>
          </APIProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </div>
  );
};

export default memo(App, () => true);
