import entityServiceFactory from "./entityServiceFactory.js";

const yeastService = entityServiceFactory("yeast", "yeasts", {
  YEAST_TYPES: [
    "Ale",
    "Lager",
    "Wheat",
    "Wine",
    "Champagne",
    "Kveik",
  ],
  FLOCCULATION_TYPES: ["Low", "Medium", "High", "Very High"],
});

export default yeastService;