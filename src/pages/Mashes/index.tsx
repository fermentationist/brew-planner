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

 export const MASH_STEP_TYPES = [
  "Infusion",
  "Temperature",
  "Decoction"
];

export const mashInputs = [
  {
    name: "name",
    label: "Name",
    modalStep: 0,
    type: "text",
    validation: {
      ...required,
      maxLength: 100,
    },
    errorMessages: {
      ...requiredMessage,
      maxLength: "Name must be 100 characters or less",
    },
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
    modalStep: 0,
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
    modalStep: 0,
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
    modalStep: 0,
    type: "switch",
    defaultChecked: false,
    tableOptions: columnOptions.booleanOptions,
    width: "250px",
  },
  {
    name: "notes",
    label: "Notes",
    modalStep: 0,
    type: "textarea",
    tableOptions: columnOptions.createEllipsisOptions(10),
    width: "250px",
  },
];

export const mashStepInputs = [
  {
    name: "name",
    label: "Name",
    modalStep: 1,
    type: "text",
    excludeFromColumns: true,
    validation: {
      ...required,
      maxLength: 100,
    },
    errorMessages: {
      ...requiredMessage,
      maxLength: "Name must be 100 characters or less",
    },
    width: "250px",
  },
  {
    name: "type",
    label: "Type",
    modalStep: 1,
    type: "select",
    excludeFromColumns: true,
    selectOptions: MASH_STEP_TYPES,
    validation: required,
    errorMessages: requiredMessage,
    width: "250px",
  },
  {
    name: "infuseAmount",
    label: "Infusion volume",
    modalStep: 1,
    type: "numberWithUnits",
    excludeFromColumns: true,
    convertOnUnitChange: true,
    preferredUnitKeyField: "mashUuid",
    allowNegative: false,
  },
  {
    name: "stepTemp",
    label: "Step temperature",
    modalStep: 1,
    type: "numberWithUnits",
    excludeFromColumns: true,
    convertOnUnitChange: true,
    validation: {
      ...required,
      min: 0,
    },
    errorMessages: {
      ...requiredMessage,
      min: "Please enter a positive number",
    },
    preferredUnitKeyField: "mashUuid",
    allowNegative: false,
  },
  {
    name: "stepTime",
    label: "Step time",
    modalStep: 1,
    type: "numberWithUnits",
    validation: {
      ...required,
      min: 0,
    },
    errorMessages: {
      ...requiredMessage,
      min: "Please enter a positive number",
    },
    excludeFromColumns: true,
    convertOnUnitChange: true,
    preferredUnitKeyField: "mashUuid",
    allowNegative: false,
  },
  {
    name: "rampTime",
    label: "Ramp time",
    modalStep: 1,
    type: "numberWithUnits",
    validation: {
      min: 0,
    },
    errorMessages: {
      min: "Please enter a positive number",
    },
    excludeFromColumns: true,
    convertOnUnitChange: true,
    preferredUnitKeyField: "mashUuid",
    allowNegative: false,
  },
  {
    name: "endTemp",
    label: "End temperature",
    modalStep: 1,
    type: "numberWithUnits",
    validation: {
      min: 0,
    },
    errorMessages: {
      min: "Please enter a positive number",
    },
    excludeFromColumns: true,
    convertOnUnitChange: true,
    preferredUnitKeyField: "mashUuid",
    allowNegative: false,
  }
];

const mainStep = {
  displayName: "Mash",
  pluralDisplayName: "Mashes",
  routeName: "mashes",
  entityKey: "mashUuid",
  inputList: mashInputs,
}
const dependentSteps = [
  {
    displayName: "Mash step",
    pluralDisplayName: "Mash steps",
    routeName: "mash_steps",
    entityKey: "mashStepUuid",
    dependency: "mashUuid",
    inputList: mashStepInputs,
  },
];

const Mashes = entityPageFactory<MashData>({entityName: ["mash", "mash_step"], pluralEntityName: ["mashes", "mash_steps"], inputList: mashInputs, numModalSteps: 2, submitEachModalStep: true, stepKeys: ["mashUuid"], title: ["Mash", "Mash step"]});

export default Mashes;