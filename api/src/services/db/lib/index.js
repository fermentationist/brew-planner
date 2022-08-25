import DB from "./DB.js";
import { ProgramError } from "../../../server/errors.js";
// Invoking this function with a configuration object will return a database instance
const initDB = (connectionParams) => {
  let tz = connectionParams.timezone || "";
  if (!connectionParams.host || !connectionParams.user || !connectionParams.database) {
    throw(new ProgramError("Incomplete database configuration."));
  }
  if (tz &&
    !["local", "utc", "z"].includes(tz.toLowerCase()) &&
    !["+", "-"].includes(tz[0])
    ) {
    throw(new ProgramError("Invalid timezone in database configuration."));
  }
  if (tz.toLowerCase() === "utc" || tz.toLowerCase() === "z") {
    tz = "Z"; // MySQL uses "Z" (for "Zulu time"), instead of "UTC"
  }
  return new DB({...connectionParams, timezone: tz});
}

export default initDB;
