import breweryEntityPageFactory from "../../componentFactories/breweryEntityPageFactory";
import { HopData } from "../../types";
import {percentage, percentageMessage, required, requiredMessage} from "../../utils/validationHelpers";

export const hopInputs = [
  {
    name: "name",
    label: "Name",
    type: "text",
    validation: required,
    errorMessages: requiredMessage,
    width: "250px",
  },
  {
    name: "alpha",
    label: "Alpha acids (%)",
    type: "number",
    validation: { ...required, ...percentage },
    errorMessages: { ...requiredMessage, ...percentageMessage },
    width: "250px",
  },
  {
    name: "beta",
    label: "Beta acids (%)",
    type: "number",
    width: "250px",
    validation: percentage,
    errorMessages: percentageMessage,
    tableOptions: {
      display: false,
    },
  },
  {
    name: "form",
    label: "Form",
    type: "select",
    selectOptions: ["Pellet", "Plug", "Leaf"],
    selectRestricted: true,
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
    name: "humulene",
    label: "Humulene (%)",
    type: "number",
    width: "250px",
    validation: percentage,
    errorMessages: percentageMessage,
    tableOptions: {
      display: false,
    },
  },
  {
    name: "caryophyllene",
    label: "Caryophyllene (%)",
    type: "number",
    width: "250px",
    validation: percentage,
    errorMessages: percentageMessage,
    tableOptions: {
      display: false,
    },
  },
  {
    name: "cohumulone",
    label: "Cohumulone (%)",
    type: "number",
    width: "250px",
    validation: percentage,
    errorMessages: percentageMessage,
    tableOptions: {
      display: false,
    },
  },
  {
    name: "myrcene",
    label: "Myrcene (%)",
    type: "number",
    width: "250px",
    validation: percentage,
    errorMessages: percentageMessage,
    tableOptions: {
      display: false,
    },
  },
];

const Hops = breweryEntityPageFactory<HopData>("hop", hopInputs);

export default Hops;
