
// Because of a setting in .mocharc.cjs, this file will run first, before any other tests
import dotenv from "dotenv";
dotenv.config();

const PROD_MODE = process.env.PROD_MODE === "false" ? false : true;

if (PROD_MODE) {
  throw new Error("Running in PROD_MODE! Aborting tests!");
}
