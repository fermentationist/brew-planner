import entityPageFactory from "../../componentFactories/entityPageFactory";
import { YeastData } from "../../types";
import {required, requiredMessage, percentage, percentageMessage, maxLengthErrorMessageFactory} from "../../utils/validationHelpers";

export const yeastInputs = [
  {
    name: "name",
    label: "Name",
    type: "text",
    validation: {...required, maxLength: 100},
    errorMessages: {...requiredMessage, maxLength: "Maximum length - 100 characters"},
    width: "250px",
  },
  {
    name: "type",
    label: "Type",
    type: "select",
    selectOptions: ["Ale", "Lager", "Wheat", "Wine", "Champagne", "Kveik"],
    selectRestricted: true,
    validation: required,
    errorMessages: requiredMessage,
    width: "250px",
  },
  {
    name: "laboratory",
    label: "Manufacturer",
    type: "text",
    width: "250px",
    validation: {maxLength: 100},
    errorMessages: maxLengthErrorMessageFactory(100),
  },
  {
    name: "productId",
    label: "Product ID",
    type: "text",
    validation: {maxLength: 36},
    errorMessages: maxLengthErrorMessageFactory(36),
    width: "250px",
  },
  {
    name: "minTemperature",
    label: "Min temperature",
    type: "fakeNumber",
    width: "250px",
    tableOptions: {
      display: false,
    },
  },
  {
    name: "maxTemperature",
    label: "Max temperature",
    type: "fakeNumber",
    width: "250px",
    tableOptions: {
      display: false,
    },
  },
  {
    name: "flocculation",
    label: "Flocculation",
    type: "select",
    selectOptions: ["Low", "Medium", "High", "Very High"],
    selectRestricted: true,
    width: "250px",
    tableOptions: {
      display: false,
    },
  },
  {
    name: "attenuation",
    label: "Attenuation (%)",
    type: "fakeNumber",
    width: "250px",
    validation: percentage,
    errorMessages: percentageMessage,
    tableOptions: {
      display: false,
    },
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    width: "250px",
    tableOptions: {
      display: false,
    },
  },
  {
    name: "bestFor",
    label: "Styles",
    type: "text",
    width: "250px",
    tableOptions: {
      display: false,
    },
  },
  {
    name: "maxReuse",
    label: "Max repitches",
    type: "fakeNumber",
    step: "1",
    width: "250px",
    validation: {min: 0},
    errorMessages: {min: "Please enter a positive integer"},
    tableOptions: {
      display: false,
    },
  },
  
];

const Yeasts = entityPageFactory<YeastData>("yeast", yeastInputs);

export default Yeasts;