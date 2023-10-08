import type { ReducerAction } from "../../types/index.d.ts";

export const authReducer = (state: any, action: ReducerAction) => {
  switch (action.type) {
    case "OVERWRITE_AUTH_STATE":
      return action.payload;
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
      };
    case "SET_FIREBASE_USER":
      return {
        ...state,
        firebaseUser: action.payload,
      };
    case "SET_LOADED":
      return {
        ...state,
        loaded: action.payload,
      };
    case "SET_CURRENT_BREWERY":
      return {
        ...state,
        currentBrewery: action.payload,
      };
    case "SET_ACCESS_TOKEN":
      return {
        ...state,
        accessToken: action.payload,
      };
    case "SET_TOKEN_EXPIRATION":
      return {
        ...state,
        tokenExpiration: action.payload,
      };
    default:
      return state;
  }
}