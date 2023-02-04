import { Route, Routes } from "react-router-dom";
import RequireAuth from "../RequireAuth";
import Layout from "../Layout";
import Login from "../../pages/Login";
import ErrorPage from "../../pages/ErrorPage";
import routeConfig from "../../config/routeConfig.js";

const ClientRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* all of the following nested <Route/>s will be rendered by the <Outlet/> component that is used within in the <Layout/> component */}
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
  )
}

export default ClientRouter;