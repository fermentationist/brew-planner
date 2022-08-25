/* global */

// Because of a setting in .mocharc.cjs, this file will run first, before any other tests
import dotenv from "dotenv";
dotenv.config();

const TEST_MODE = process.env.TEST_MODE === "true" ? true : false;

if (!TEST_MODE) {
  throw new Error("Not in TEST_MODE! Aborting tests!");
}
