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

export type FermentableType =
  | "Grain"
  | "Sugar"
  | "Extract"
  | "Dry Extract"
  | "Adjunct";

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

export type HopForm = "Pellet" | "Plug" | "Leaf";

export interface HopData {
  hopUuid: string;
  createdBy: string;
  version: number;
  name: string;
  alpha: number;
  beta?: number;
  form?: HopForm;
  notes?: string;
  origin?: string;
  supplier?: string;
  humulene?: number;
  caryophyllene?: number;
  cohumulone?: number;
  myrcene?: number;
  createdAt: number;
  data?: any;
}

export interface WaterData {
  waterUuid: string;
  createdBy: string;
  name: string;
  calcium?: number;
  bicarbonate?: number;
  sulfate?: number;
  chloride?: number;
  sodium?: number;
  magnesium?: number;
  ph?: number;
  notes?: string;
  createdAt: number;
  data?: any;
}

export type YeastType =
  | "Ale"
  | "Lager"
  | "Wheat"
  | "Wine"
  | "Champagne"
  | "Kveik";

export type FlocculationType = "Low" | "Medium" | "High" | "Very High";

export interface YeastData {
  yeastUuid: string;
  createdBy: string;
  name: string;
  type?: YeastType;
  laboratory?: string;
  productId?: string;
  minTemperature?: number;
  maxTemperature?: number;
  flocculation?: FlocculationType;
  attenuation?: number;
  notes?: string;
  bestFor?: string;
  maxReuse?: number;
  createdAt: number;
  data?: any;
}
