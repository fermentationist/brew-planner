import breweryEntityPageFactory from "../../componentFactories/breweryEntityPageFactory";
import { WaterData } from "../../types";
import {required, requiredMessage, positiveNumber, positiveNumberMessage} from "../../utils/validationHelpers";

export const waterInputs = [
  {
    name: "name",
    label: "Name",
    type: "text",
    validation: {...required, maxLength: 100},
    errorMessages: {...requiredMessage, maxLength: "Maximum length - 100 characters"},
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

const Waters = breweryEntityPageFactory<WaterData>("water", waterInputs, "water profile");

export default Waters;