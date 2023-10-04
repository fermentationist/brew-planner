import entityPageFactory from "../../componentFactories/entityPageFactory";
import { MashData } from "../../types";
import { columnOptions } from "../../components/DataTable";
import {required, requiredMessage} from "../../utils/validationHelpers";

/*
  mashUuid: string;
  name: string;
  createdBy: string;
  grainTemp?: number;
  tunTemp?: number;
  spargeTemp?: number;
  ph?: number;
  tunWeight?: number;
  notes?: string;
  tunSpecificHeat?: number;
  equipAdjust?: boolean;
  */

export const mashInputs = [
  {
    name: "name",
    label: "Name",
    modalStep: 0,
    type: "text",
    validation: required,
    errorMessages: requiredMessage,
    width: "250px",
  },
  {
    name: "grainTemp",
    label: "Grain temp",
    modalStep: 0,
    type: "numberWithUnits",
    convertOnUnitChange: true,
    preferredUnitKeyField: "mashUuid",
    validation: {min: 0},
    errorMessages: {min: "Please enter a positive number"},
    width: "250px",
  },
  {
    name: "tunTemp",
    label: "Tun temp",
    modalStep: 0,
    type: "numberWithUnits",
    convertOnUnitChange: true,
    preferredUnitKeyField: "mashUuid",
    validation: {min: 0},
    errorMessages: {min: "Please enter a positive number"},
    width: "250px",
  },
  {
    name: "spargeTemp",
    label: "Sparge temp",
    modalStep: 0,
    type: "numberWithUnits",
    convertOnUnitChange: true,
    preferredUnitKeyField: "mashUuid",
    validation: {min: 0},
    errorMessages: {min: "Please enter a positive number"},
    width: "250px",
  },
  {
    name: "ph",
    label: "ph",
    modalStep: 0,
    type: "fakeNumber",
    validation: {min: 0},
    errorMessages: {min: "Please enter a positive number"},
    width: "250px",
  },
  {
    name: "tunWeight",
    label: "Tun weight",
    modalStep: 1,
    type: "numberWithUnits",
    convertOnUnitChange: true,
    preferredUnitKeyField: "mashUuid",
    validation: {min: 0},
    errorMessages: {min: "Please enter a positive number"},
    width: "250px",
  },
  {
    name: "tunSpecificHeat",
    label: "Tun specific heat",
    modalStep: 1,
    type: "numberWithUnits",
    convertOnUnitChange: true,
    preferredUnitKeyField: "mashUuid",
    validation: {min: 0},
    errorMessages: {min: "Please enter a positive number"},
    width: "250px",
  },
  {
    name: "equipAdjust",
    label: "Equipment adjustment",
    modalStep: 1,
    type: "switch",
    defaultChecked: false,
    tableOptions: columnOptions.booleanOptions,
    width: "250px",
  },
  {
    name: "notes",
    label: "Notes",
    modalStep: 1,
    type: "textarea",
    tableOptions: columnOptions.createEllipsisOptions(10),
    width: "250px",
  },
];

const Mashes = entityPageFactory<MashData>({entityName: "mash", pluralEntityName: "mashes", inputList: mashInputs, numModalSteps: 2});

export default Mashes;