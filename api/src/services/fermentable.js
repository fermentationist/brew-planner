import entityServiceFactory from "./entityServiceFactory.js";

const fermentableService = entityServiceFactory("fermentable", "fermentables", {
  FERMENTABLE_TYPES: [
    "Grain",
    "Sugar",
    "Extract",
    "Dry Extract",
    "Adjunct",
  ],
});

export default fermentableService;