import entityServiceFactory from "./entityServiceFactory.js";

const hopService = entityServiceFactory("hop", "hops", {
  HOP_FORMS: ["Pellet", "Plug", "Leaf"],
});

export default hopService;