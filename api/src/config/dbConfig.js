import dotenv from "dotenv";
import { stringify as uuidStringify } from "uuid";
dotenv.config();

export default {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  timezone: "utc",
  typeCast: function (field, next) {
    // cast TINYINT as boolean
    if (field.type === "TINY" && field.length === 1) {
      return field.string() === "1"; // 1 = true, 0 = false
    } else if (field.type === "STRING" && field.packet.charsetNr === 63) {
      // charSetNr 63 = BINARY, assume binary strings are uuids, convert to hex string
      try {
        return uuidStringify(field.buffer());
      } catch (error) {
        console.log("Error in mysql driver configuration typeCast function!");
        console.error(error);
        return next();
      }
    } else {
      return next();
    }
  },
};
