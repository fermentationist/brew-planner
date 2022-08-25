import Header from "../Header";
import Menu from "../Menu";
import ErrorBoundary from "../ErrorBoundary";
import menuItems from "../../config/menuItems";
import Settings from "../Settings";
import Box from "@mui/material/Box";
import { Outlet } from "react-router-dom";
import styled from "styled-components";
import useGlobalState from "../../hooks/useGlobalState";

const LayoutContainer = styled.div`
  min-width: 100vw;
  min-height: 100vh;
  position: relative;
`;

const Main = styled(Box)`
  height: 100vh;
  position: relative;
  margin-top: ${props => props.theme?.componentStyles?.Header?.desktop?.height};
  @media screen and (max-width: 600px) {
    margin-top: ${props =>
      props.theme?.componentStyles?.Header?.mobile?.height};
  }
`;

const Layout = () => {
  const [globalState] = useGlobalState();
  return (
    <LayoutContainer>
      <Header>
        <Settings />
      </Header>
      <Main component="main">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
        {globalState?.menu?.isOpen ? <Menu menuItems={menuItems} /> : null}
      </Main>
    </LayoutContainer>
  );
};

export default Layout;
