import Model from "./Model.js";

const Models = {};

const modelNames = [
  "brewery",
  "brewhouse",
  "recipe",
  "fermentable",
  "hop",
  "water",
  "yeast",
  "misc"
];

for (const modelName of modelNames) {
  Models[modelName] = new Model(modelName);
  await Models[modelName].init();
}

export default Models;