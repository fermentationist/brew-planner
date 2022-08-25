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
    breweries: number[];
  };
  loaded: boolean;
  currentBrewery?: number;
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
  breweryId: number;
  street?: string;
  unit?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface InventoryEntry {
  inventory: {
    inventoryId: string;
    available: number;
    allocated: number;
    price: number;
    addedAt: number;
  };
  brewery: {
    breweryId: string;
    name: string;
    addedAt: number;
    address?: {
      street?: string;
      unit?: string;
      city?: string;
      state?: string;
      country?: string;
    };
  };
  variant: ProductVariant;
}

export interface ProductVariant {
  sku: string;
  fullname: string;
  variantName: string;
  productName: string;
  brandName: string;
  upc?: string;
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
  addedAt: number;
}

export interface CustomerOrder {
  orderId: string;
  email: string;
  placedAt: number;
  isRefunded: boolean;
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
  billingUnit?: string;
  billingStreet?: string;
  billingCity?: string;
  billingState?: string;
  billingZip?: string;
  billingCountry?: string;
  salesChannel: {
    name: string;
    salesChannelId: string;
  };
}
