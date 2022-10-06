import { Route, Routes } from "react-router-dom";
import RequireAuth from "./components/RequireAuth";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import ErrorPage from "./pages/ErrorPage";
import routeConfig from "./config/routeConfig.js";
import { ThemeProvider } from "@mui/material/styles";
import {lightTheme, darkTheme} from "./config/themes";
import useGlobalState from "./hooks/useGlobalState";
import Alerts from "./components/Alerts";
import AlertStateProvider from "./context/AlertStateProvider";
import APIProvider from "./context/APIProvider";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import queryClientConfig from "./config/queryClientConfig";
const queryClient = new QueryClient(queryClientConfig);


const App = () => {
  const [globalState] = useGlobalState();
  return (
    <div className="App" style={{position: "absolute"}}>
      <ThemeProvider theme={globalState?.theme === "dark" ? darkTheme : lightTheme}>
        <QueryClientProvider client={queryClient}>
          <APIProvider>
            <AlertStateProvider>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route
                    path="/unauthorized"
                    element={<ErrorPage errorCode={401} />}
                  />
                  <Route path="/not_found" element={<ErrorPage errorCode={404} />} />
                  <Route path="/login" element={<Login />} />

                  {/* Protected Routes */}
                  {Object.entries(routeConfig).map((entry, index) => {
                    return (
                      <Route
                        element={<RequireAuth allowedRoles={entry[1].roles} />}
                        key={index}
                      >
                        <Route path={entry[0]} element={entry[1].component} />
                      </Route>
                    );
                  })}
                  
                  <Route path="/*" element={<ErrorPage errorCode={404} />} />
                </Route>
              </Routes>
              <Alerts />
            </AlertStateProvider>
          </APIProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </div>
  );
};

export default App;
