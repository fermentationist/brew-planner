import Page from "../components/Page";
import ErrorPage from "../pages/ErrorPage";
import StyledSpinner from "../components/styled/StyledSpinner";
import useAuth from "../hooks/useAuth";
import { ComponentType } from "react";

const withBreweryRequired = (Component: ComponentType) => {
  return (props: any) => {
    const { auth } = useAuth();
    console.log("auth", auth);
    if (!auth.loaded) {
      return (
        <Page>
          <StyledSpinner />
        </Page>
      );
    }
    if (!auth.currentBrewery) {
      return (
        <ErrorPage errorTitle="No brewery selected" errorMessage="Please select a brewery from the settings menu to view this page" />
      );
    }
    return <Component {...props} />
  }
}

export default withBreweryRequired;
