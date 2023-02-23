import breweryEntityPageFactory from "../../componentFactories/breweryEntityPageFactory";
import { MiscData } from "../../types";
import {required, requiredMessage} from "../../utils/validationHelpers";

export const miscInputs = [
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
    selectOptions: ["Spice", "Fining", "Water Agent", "Herb", "Flavor", "Other"],
    selectRestricted: true,
    validation: required,
    errorMessages: requiredMessage,
    width: "250px",
  },
  {
    name: "useFor",
    label: "Recommended use",
    type: "text",
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
      display: false,
    },
  },
  
];

const Miscs = breweryEntityPageFactory<MiscData>("misc", miscInputs, "miscellaneous addition");

export default Miscs;