import React, { useState, useEffect } from "react";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { Link } from "react-router-dom";
import { MenuItem } from "../../../types";
import {styled as muiStyled} from "@mui/material/styles";
import styled from "styled-components";
import Menu, { CollapsedState } from "../index";
import { useLocation } from "react-router-dom";
import "./MenuOption.css";

export interface MenuOptionProps extends MenuItem {
  expandable: boolean;
  toggleExpandCollapse: (name: string) => void;
  collapsedState: CollapsedState;
  closeDrawer: () => void;
}

const MenuListItem = muiStyled(ListItem)`
  border: none;
  cursor: pointer;
`;

const MenuLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

const StyledCollapse = muiStyled(Collapse)`
  margin-left: 1em;
`;

const MenuOption = function (props: MenuOptionProps) {
  props.subMenu?.length && console.log("menuOption props:", props)
  const defaultPath = useLocation().pathname;
  props.subMenu?.length && console.log("path::", defaultPath)
  const [path, setPath] = useState(defaultPath);
  useEffect(() => {
    setPath(defaultPath);
  }, [defaultPath]);
  
  const getCollapsedState = () => {
    const children = props.subMenu || [];
    const activeChildren = children.filter(function childFilter(child) {
      if (child.link === path) {
        return true;
      }
      if (child.subMenu?.length) {
        const activeGrandchildren: any = (child.subMenu || []).filter(
          childFilter
        );
        return activeGrandchildren.length;
      }
    });
    const result = activeChildren.length
      ? true
      : (props.collapsedState?.[props.title] || false);
    props.subMenu?.length && console.log("getCollapsedState result:", result)
    return result;
  };
  
  const LinkItem = (
    <MenuListItem className={`menu-option ${
      path === props.link ? "active-link" : "inactive-link"
    }`}>
      {props.link ? (
        <MenuLink to={props.link} onClick={props.closeDrawer}>
          <ListItemText primary={props.title} />
        </MenuLink>
      ) : (
        <ListItemText primary={props.title} />
      )}
    </MenuListItem>
  );

  const ExpandableItem = (
    <>
      <MenuListItem
        onClick={() => {
          props.toggleExpandCollapse && props.toggleExpandCollapse(props.title);
        }}
      >
        <ListItemText primary={props.title} />
        {getCollapsedState() ? <ExpandLess /> : <ExpandMore />}
      </MenuListItem>
      <StyledCollapse in={getCollapsedState()} timeout="auto">
        <Menu menuItems={props.subMenu || []} nested={true} />
      </StyledCollapse>
    </>
  );
  return props.expandable ? ExpandableItem : LinkItem;
};

export default MenuOption;
