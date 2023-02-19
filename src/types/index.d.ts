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

export type ChildProps = React.PropsWithChildren["children"];

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

export interface BrewhouseData {
  name: string;
  brewhouseUuid: string;
  batchSize: number;
  kettleVol: number;
  tunVolume: number;
  tunWeight: number;
  tunLoss?: number;
  tunSpecificHeat: number;
  lauterDeadspace?: number;
  topUpWater?: number;
  trubChillerLoss?: number;
  evaporationRate: number;
  miscLoss?: number;
  extractEfficiency: number;
  grainAbsorptionRate: number;
  hopUtilization: number;
  data?: BrewhouseData;
}

export interface UserData {
  uid: string;
  displayName?: string;
  email: string;
  customClaims: {
    role: string;
    breweries?: string[];
  };
  breweries?: BreweryData[];
}

export type FermentableType = "Grain" | "Sugar" | "Extract" | "Dry Extract" | "Adjunct"

export interface FermentableData {
  fermentableUuid: string;
  createdBy: string;
  version: number;
  name: string;
  type: FermentableType;
  yield: number;
  color: number;
  origin?: string;
  supplier?: string;
  coarseFineDiff?: number;
  moisture?: number;
  diastaticPower?: number;
  protein?: number;
  maxInBatch?: number;
  recommendedMash?: boolean;
  notes?: string;
  addAfterBoil?: boolean;
  createdAt: number;
  data?: any;
}

export type Mode = "create" | "edit";