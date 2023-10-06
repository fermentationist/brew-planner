import entityPageFactory from "../../componentFactories/entityPageFactory";
import { HopData } from "../../types";
import {percentage, percentageMessage, required, requiredMessage} from "../../utils/validationHelpers";
import { columnOptions } from "../../components/DataTable";

export const hopInputs = [
  {
    name: "name",
    label: "Name",
    type: "text",
    validation: required,
    errorMessages: requiredMessage,
    width: "250px",
    modalStep: 0,
  },
  {
    name: "alpha",
    label: "Alpha acids (%)",
    type: "fakeNumber",
    validation: { ...required, ...percentage },
    errorMessages: { ...requiredMessage, ...percentageMessage },
    width: "250px",
    modalStep: 0,
  },
  {
    name: "beta",
    label: "Beta acids (%)",
    type: "fakeNumber",
    width: "250px",
    validation: percentage,
    errorMessages: percentageMessage,
    tableOptions: {
      display: false,
    },
    modalStep: 0,
  },
  {
    name: "form",
    label: "Form",
    type: "select",
    selectOptions: ["Pellet", "Plug", "Leaf"],
    selectRestricted: true,
    width: "250px",
    modalStep: 0,
  },
  {
    name: "origin",
    label: "Origin",
    type: "text",
    width: "250px",
    tableOptions: {
      display: false,
    },
    modalStep: 0,
  },
  {
    name: "supplier",
    label: "Supplier",
    type: "text",
    width: "250px",
    tableOptions: {
      display: false,
    },
    modalStep: 0,
  },
  {
    name: "humulene",
    label: "Humulene (%)",
    type: "fakeNumber",
    width: "250px",
    validation: percentage,
    errorMessages: percentageMessage,
    tableOptions: {
      display: false,
    },
    modalStep: 1,
  },
  {
    name: "caryophyllene",
    label: "Caryophyllene (%)",
    type: "fakeNumber",
    width: "250px",
    validation: percentage,
    errorMessages: percentageMessage,
    tableOptions: {
      display: false,
    },
    modalStep: 0,
  },
  {
    name: "cohumulone",
    label: "Cohumulone (%)",
    type: "fakeNumber",
    width: "250px",
    validation: percentage,
    errorMessages: percentageMessage,
    tableOptions: {
      display: false,
    },
    modalStep: 1,
  },
  {
    name: "myrcene",
    label: "Myrcene (%)",
    type: "fakeNumber",
    width: "250px",
    validation: percentage,
    errorMessages: percentageMessage,
    tableOptions: {
      display: false,
    },
    modalStep: 1,
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    width: "250px",
    tableOptions: {
      display: false,
      ...columnOptions.createEllipsisOptions(10)
    },
    modalStep: 1,
  },
];

const Hops = entityPageFactory<HopData>("hop", hopInputs);

export default Hops;
