import React, { memo, useState } from "react";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import Tooltip from "@mui/material/Tooltip";
import { MenuProps } from "../../types";
import styled from "styled-components";
import MenuOption from "./MenuOption";
import useGlobalState from "../../hooks/useGlobalState";
import useAuth from "../../hooks/useAuth";
import routes from "../../config/routeConfig";
import { getAllowedRoles } from "../../utils/helpers";
import { IMenuItem } from "../../config/menuItems";

export interface CollapsedState {
  [key: string]: boolean;
}

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  padding: inherit;
  justify-content: flex-start;
  height: ${props => props.theme?.componentStyles?.Header?.desktop?.height};
  @media screen and (max-width: 600px) {
    height: ${props => props.theme?.componentStyles?.Header?.mobile?.height};
  }
`;

const Menu = ({menuItems, nested}: MenuProps) => {
  const [globalState, dispatch] = useGlobalState();
  const menuState = globalState.menu;
  const [collapsedState, setCollapsedState] = useState<CollapsedState>(
    menuState?.collapsedState
  );
  const { auth: [authState] } = useAuth();
  const toggleExpandCollapse = (title: string) => {
    const titleState = (collapsedState && collapsedState[title]) || false;
    const newCollapsedState = {
      ...collapsedState,
      [title]: !titleState
    };
    setCollapsedState(newCollapsedState);
    dispatch({
      type: "SET_MENU_COLLAPSED_STATE",
      payload: newCollapsedState
    });
  };
  const closeDrawer = () => {
    dispatch({
      type: "CLOSE_MENU"
    });
  };

  const  displayMenuItem = (menuItem: any): boolean => {
    if (typeof menuItem.link == "string") {
      const allowedRoles = getAllowedRoles(menuItem.link, routes) || [];
      if (!allowedRoles.includes(authState?.user?.role)) {
        // do not display menuItem if user is not authorized
        return false;
      }
    } else if (menuItem.subMenu && Array.isArray(menuItem.subMenu)) {
      return menuItem.subMenu.some((subItem: IMenuItem) => { // display menu item if user is authorized for at least one of its subItems
        return displayMenuItem(subItem); // recur
      })
    }
    return true;
  }

  return (
    <>
      {
        nested ? (
          <>
          {
            menuItems.map((item, index) => {
              if (!displayMenuItem(item)) {
                return null;
              }
              return (
                <MenuOption
                  title={item.title}
                  link={item.link}
                  subMenu={item.subMenu}
                  key={index}
                  expandable={!!item.subMenu?.length}
                  toggleExpandCollapse={toggleExpandCollapse}
                  collapsedState={collapsedState}
                  closeDrawer={closeDrawer}
                />
              );
            })
          }
          </>
        ) : (
          <>
            {
              globalState?.menu?.isOpen ? (
                <Drawer
                  open={globalState?.menu?.isOpen}
                  onClose={closeDrawer}
                >
                  <DrawerHeader>
                    <Tooltip title="Close">
                      <IconButton onClick={closeDrawer}>
                        <ChevronLeftIcon />
                      </IconButton>
                    </Tooltip>
                  </DrawerHeader>
                  <Divider />
                  <List>
                    {menuItems.map((item, index) => {
                      if (!displayMenuItem(item)) {
                        return null;
                      }
                      return (
                        <MenuOption
                          title={item.title}
                          link={item.link}
                          subMenu={item.subMenu}
                          key={index}
                          expandable={!!item.subMenu?.length}
                          toggleExpandCollapse={toggleExpandCollapse}
                          collapsedState={collapsedState}
                          closeDrawer={closeDrawer}
                        />
                      );
                    })}
                  </List>
                </Drawer>
              ) : null
            }
          </>
        )
      }
    </>
  );
};

export default memo(Menu, () => true);
