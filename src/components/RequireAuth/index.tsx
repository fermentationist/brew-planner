import { useLocation, Navigate, Outlet } from "react-router-dom";
import Page from "../Page";
import StyledSpinner from "../styled/StyledSpinner";
import useAuth from "../../hooks/useAuth";
import { memo } from "react";

export interface RequireAuthProps {
  allowedRoles: (string | number)[];
}


const RequireAuth = function ({ allowedRoles }: RequireAuthProps) {
  const {auth: [authState]} = useAuth();
  const location = useLocation();
  if (!authState.loaded) {
  return (
      <Page>
        <StyledSpinner />
      </Page>
    );
  }
  
  const role = authState?.user?.role;
  if (allowedRoles?.includes(role)) {
    // user is logged in and role matches - allow access to children
    return <Outlet />; 
  } else if (authState?.user) {
    // user is logged in but lacks required role
    return <Navigate to="/unauthorized" state={{ from: location }} replace />; 
  }
  // user is not logged in
  return <Navigate to="/login" state={{ from: location }} replace />; 
};

export default memo(RequireAuth, (prevProps, nextProps) => prevProps.allowedRoles === nextProps.allowedRoles);
