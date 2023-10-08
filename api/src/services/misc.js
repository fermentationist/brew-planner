import entityServiceFactory from "./entityServiceFactory.js";

const miscService = entityServiceFactory("misc", "miscs", {
  MISC_TYPES: [
    "Spice",
    "Fining",
    "Water Agent",
    "Herb",
    "Flavor",
    "Other",
  ],
});

export default miscService;