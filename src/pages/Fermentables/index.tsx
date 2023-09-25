import entityPageFactory from "../../componentFactories/entityPageFactory";
import { FermentableData } from "../../types";
import {percentage, percentageMessage, required, requiredMessage} from "../../utils/validationHelpers";

export const fermentableInputs = [
  {
    name: "name",
    label: "Name",
    type: "text",
    validation: required,
    errorMessages: requiredMessage,
    width: "250px",
  },
  {
    name: "type",
    label: "Type",
    type: "select",
    selectOptions: ["Grain", "Sugar", "Extract", "Dry Extract", "Adjunct"],
    selectRestricted: true,
    validation: required,
    errorMessages: requiredMessage,
    width: "250px",
  },
  {
    name: "yield",
    label: "Yield (%)",
    type: "fakeNumber",
    validation: {...required, ...percentage},
    errorMessages: {...requiredMessage, ...percentageMessage},
    maxDecPlaces: 2,
    width: "250px",
  },
  {
    name: "color",
    label: "Color (ºL)",
    type: "fakeNumber",
    validation: {...required, min: 0},
    errorMessages: {...requiredMessage, min: "Please enter a positive number"},
    width: "250px",
  },
  {
    name: "origin",
    label: "Origin",
    type: "text",
    width: "250px",
    tableOptions: {
      display: false,
    },
  },
  {
    name: "supplier",
    label: "Supplier",
    type: "text",
    width: "250px",
    tableOptions: {
      display: false,
    },
  },
  {
    name: "coarseFineDiff",
    label: "Coarse/Fine Difference (%)",
    type: "fakeNumber",
    width: "250px",
    validation: percentage,
    errorMessages: percentageMessage,
    tableOptions: {
      display: false,
    },
  },
  {
    name: "moisture",
    label: "Moisture (%)",
    type: "fakeNumber",
    width: "250px",
    validation: percentage,
    errorMessages: percentageMessage,
    tableOptions: {
      display: false
    }
  },
  {
    name: "disataticPower",
    label: "Diastatic power (ºL)",
    type: "fakeNumber",
    width: "250px",
    validation: percentage,
    errorMessages: percentageMessage,
    tableOptions: {
      display: false
    }
  },
  {
    name: "protein",
    label: "Protein (%)",
    type: "fakeNumber",
    width: "250px",
    validation: percentage,
    errorMessages: percentageMessage,
    tableOptions: {
      display: false
    }
  },
  {
    name: "maxInBatch",
    label: "Max per batch (%)",
    type: "fakeNumber",
    width: "250px",
    validation: percentage,
    errorMessages: percentageMessage,
    tableOptions: {
      display: false
    }
  },
  {
    name: "recommendedMash",
    label: "Mash recommended",
    type: "select",
    selectOptions: ["true", "false"],
    transform: (val?: string) => val === "true" ? true : val === "false" ? false : val,
    selectRestricted: true,
    width: "250px",
    tableOptions: {
      display: false
    }
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    width: "250px",
    tableOptions: {
      display: false
    }
  },
  {
    name: "addAfterBoil",
    label: "Add post-boil",
    type: "select",
    selectOptions: ["true", "false"],
    selectRestricted: true,
    transform: (val?: string) => val === "true" ? true : val === "false" ? false : val,
    width: "250px",
    tableOptions: {
      display: false
    }
  }
];

const Fermentables = entityPageFactory<FermentableData>("fermentable", fermentableInputs);

export default Fermentables;