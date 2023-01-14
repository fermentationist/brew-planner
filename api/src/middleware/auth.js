import {opError} from "../server/errors.js"; 
import {verifyToken} from "../services/user.js";

export const useAuth = async (req, res, next) => {
  const authToken = req.get("Firebase-Token");
  if (authToken) {
    const decoded = await verifyToken(authToken).catch(() => null);
    if (decoded) {
      res.locals.is_authorized = true;
      res.locals.user = {
        uid: decoded.uid,
        email: decoded.email,
        breweries: decoded.breweries,
        role: decoded.role
      }
      return next();
    } 
  }
  return next(opError("Invalid token", {name: "unauthorized", httpCode: 401}));
}

export const protectAdminRoutes = (req, res, next) => {
  if (res.locals.user.role === "admin") {
    return next();
  }
  return next(opError("You are not authorized to access this route", {name: "forbidden", httpCode: 403}));
}

export const protectBreweryRoutes = (req, res, next) => {
  if (res.locals.user.role === "admin") {
    return next();
  }
  const breweryUuid = req.params.breweryUuid;
  if (res.locals.user.breweries.includes(breweryUuid)) {
    return next();
  }
  return next(opError("You are not authorized to access this brewery", {name: "forbidden", httpCode: 403}));
}
