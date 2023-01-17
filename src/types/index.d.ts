/// <reference types="vite/client" />
// ^ fixes ts error when accessing import.meta.env

import { Location } from "react-router-dom";

export interface AuthObject {
  firebaseUser: any;
  user: {
    email: string;
    uid: string;
    displayName?: string;
    role: string;
    breweries: string[];
  };
  loaded: boolean;
  currentBrewery?: string;
  accessToken: string;
  tokenExpiration: number;
  refresh?: () => void;
}

export interface ChildProps extends React.PropsWithChildren {
  [key: string]: any;
}

export interface MenuItem {
  title: string;
  link?: string;
  subMenu?: MenuItem[];
  icon?: React.FunctionComponent;
  divider?: boolean;
}

export interface MenuProps {
  menuItems: MenuItem[];
  nested?: boolean;
}

export interface RouterLocation extends Location {
  state: any;
}

export interface APIError {
  name: string;
  message: string;
  messages?: string[];
  isCustomError?: true;
  type?: string;
  stack: string;
  [key: string]: any;
}

export interface BreweryData {
  name: string;
  breweryUuid: string;
  street?: string;
  unit?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}
