import entityPageFactory from "../../componentFactories/entityPageFactory";
import { WaterData } from "../../types";
import {required, requiredMessage, positiveNumber, positiveNumberMessage, maxLengthErrorMessageFactory} from "../../utils/validationHelpers";

export const waterInputs = [
  {
    name: "name",
    label: "Name",
    type: "text",
    validation: {...required, maxLength: 100},
    errorMessages: {...requiredMessage, ...maxLengthErrorMessageFactory(100)},
    width: "250px",
  },
  {
    name: "calcium",
    label: "Calcium",
    type: "numberWithUnits",
    validation: positiveNumber,
    errorMessages: positiveNumberMessage,
    convertOnUnitChange: true,
    preferredUnitKeyField: "waterUuid",
    width: "250px",
    unitsToExclude: ["ppt", "ppq"]
  },
  {
    name: "bicarbonate",
    label: "Bicarbonate",
    type: "numberWithUnits",
    validation: positiveNumber,
    errorMessages: positiveNumberMessage,
    convertOnUnitChange: true,
    preferredUnitKeyField: "waterUuid",
    width: "250px",
    unitsToExclude: ["ppt", "ppq"]
  },
  {
    name: "sulfate",
    label: "Sulfate",
    type: "numberWithUnits",
    validation: positiveNumber,
    errorMessages: positiveNumberMessage,
    convertOnUnitChange: true,
    preferredUnitKeyField: "waterUuid",
    width: "250px",
    unitsToExclude: ["ppt", "ppq"],
  },
  {
    name: "chloride",
    label: "Chloride",
    type: "numberWithUnits",
    validation: positiveNumber,
    errorMessages: positiveNumberMessage,
    convertOnUnitChange: true,
    preferredUnitKeyField: "waterUuid",
    width: "250px",
    unitsToExclude: ["ppt", "ppq"]
  },
  {
    name: "sodium",
    label: "Sodium",
    type: "numberWithUnits",
    validation: positiveNumber,
    errorMessages: positiveNumberMessage,
    convertOnUnitChange: true,
    preferredUnitKeyField: "waterUuid",
    width: "250px",
    unitsToExclude: ["ppt", "ppq"]
  },
  {
    name: "magnesium",
    label: "Magnesium",
    type: "numberWithUnits",
    validation: positiveNumber,
    errorMessages: positiveNumberMessage,
    convertOnUnitChange: true,
    preferredUnitKeyField: "waterUuid",
    width: "250px",
    unitsToExclude: ["ppt", "ppq"]
  },
  {
    name: "ph",
    label: "pH",
    type: "number",
    validation: positiveNumber,
    errorMessages: positiveNumberMessage,
    width: "250px",
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

const Waters = entityPageFactory<WaterData>({entityName: "water", inputList: waterInputs, title: "water profile"});

export default Waters;