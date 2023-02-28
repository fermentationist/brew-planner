import entityPageFactory from "../../componentFactories/entityPageFactory";
import { MiscData } from "../../types";
import {maxLengthErrorMessageFactory, required, requiredMessage} from "../../utils/validationHelpers";

export const miscInputs = [
  {
    name: "name",
    label: "Name",
    type: "text",
    validation: {...required, maxLength: 100},
    errorMessages: {...requiredMessage, ...maxLengthErrorMessageFactory(100)},
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

const Miscs = entityPageFactory<MiscData>({entityName: "misc", inputList: miscInputs, title: "miscellaneous addition"});

export default Miscs;