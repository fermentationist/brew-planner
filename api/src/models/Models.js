import Model from "./Model.js";
import { toSnakeCase } from "../utils/helpers.js";

const Models = {};

const modelNames = [
  "brewery",
  "brewhouse",
  "recipe",
  "fermentable",
  "hop",
  "water",
  "yeast",
  "misc",
  "mash",
  "mashStep",
];

for (const modelName of modelNames) {
  Models[modelName] = new Model(toSnakeCase(modelName));
  await Models[modelName].init();
}

export default Models;