import useGlobalState from "../../hooks/useGlobalState";
import { Link } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import AppBar from "@mui/material/AppBar";
import { styled as muiStyled } from "@mui/material/styles";
import styled from "styled-components";
import { ChildProps } from "../../types";
import logo from "../../airlock_square.gif";
import { useLocation } from "react-router-dom";
import menuItems, { IMenuItem } from "../../config/menuItems";

interface MenuMap {
  [key: string]: string;
}

const StyledHeader = muiStyled(AppBar)`
  position: fixed;
`;

const HeaderContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 3fr;
  align-items: center;
  position: relative;
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  position: relative;
`;

const ToolbarContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  position: relative;
  align-items: center;
  max-height: ${props => props.theme?.componentStyles?.Header?.desktop?.height};
  @media screen and (max-width: 600px){
    max-height: ${props => props.theme?.componentStyles?.Header?.mobile?.height};
  }
`;

const HeaderLogo = styled.img`
  width: auto;
  height: calc(${props => props.theme?.componentStyles?.Header?.desktop?.height} - 20px);
  align-self: flex-start;
  justify-self: flex-start;
  margin-left: 1em;
  @media screen and (max-width: 600px) {
    height: calc(${props => props.theme?.componentStyles?.Header?.mobile?.height} - 15px);
    align-self: center;
  }
`;

const Title = styled.h1`
  display: block;
  text-align: center;
  align-self: center;
  justify-self: center;
  text-justify: center;
  font-size: 36px;
  color:#F79420;
  margin-left: 1em;
  @media screen and (max-width: 600px) {
    font-size: 12px;
  }
`;

const Button = muiStyled(IconButton)`
  margin-left: 0.5em;
`;

const Header = ({ children }: {children: ChildProps}) => {
  const [globalState, dispatch] = useGlobalState();
  const location = useLocation();
  const toggleMenu = () => {
    dispatch({
      type: globalState.menu?.isOpen ? "CLOSE_MENU" : "OPEN_MENU"
    });
    // setGlobalState({
    //   ...globalState,
    //   menu: {
    //     ...globalState.menu,
    //     isOpen: !globalState.menu?.isOpen
    //   }
    // });
  };
  const pathnameToTitle = (pathname: string) => {
    const menuReducer = (map: MenuMap, item: IMenuItem) => {
      let subMap = {};
      if (item.link) {
        map[item.link] = item.title;
      } else if (item.subMenu) {
        subMap = item.subMenu.reduce(menuReducer, {});
      }
      return {
        ...map,
        ...subMap
      };
    }
    const menuMap: MenuMap = menuItems.reduce(menuReducer, {});
    return menuMap[pathname] || null;
  }
  return (
    <StyledHeader color="default">
      <HeaderContainer >
        <TitleContainer>
          <Tooltip title="Menu">
            <Button onClick={toggleMenu}>
              <MenuIcon />
            </Button>
          </Tooltip>
          <Link to="/search">
            <HeaderLogo src={logo} alt="logo" />
            {/* <BeerIcon size="lg"/> */}
          </Link>
          <Title>{pathnameToTitle(location?.pathname)}</Title>
        </TitleContainer>
        <ToolbarContainer>{children}</ToolbarContainer>
      </HeaderContainer>
    </StyledHeader>
  );
};

export default Header;
