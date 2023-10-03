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
    type: "text",
    validation: required,
    errorMessages: requiredMessage,
    width: "250px",
  },
  {
    name: "grainTemp",
    label: "Grain temp",
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
    type: "fakeNumber",
    validation: {min: 0},
    errorMessages: {min: "Please enter a positive number"},
    width: "250px",
  },
  {
    name: "tunWeight",
    label: "Tun weight",
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
    type: "switch",
    defaultChecked: false,
    tableOptions: columnOptions.booleanOptions,
    width: "250px",
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    tableOptions: columnOptions.createEllipsisOptions(10),
    width: "250px",
  },
];

const Mashes = entityPageFactory<MashData>({entityName: "mash", pluralEntityName: "mashes", inputList: mashInputs});

export default Mashes;