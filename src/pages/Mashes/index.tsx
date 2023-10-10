import entityPageWithNestedEntityCreationFactory from "../../componentFactories/entityPageWithNestedEntityCreationFactory";
import { MashData } from "../../types";
import { columnOptions } from "../../components/DataTable";
import { required, requiredMessage } from "../../utils/validationHelpers";

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

export const MASH_STEP_TYPES = ["Infusion", "Temperature", "Decoction"];

const displayFalse = {
  display: false,
};

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
    type: "numberWithUnits",
    modalStep: 0,
    tableOptions: displayFalse,
    convertOnUnitChange: true,
    preferredUnitKeyField: "mashUuid",
    validation: { min: 0 },
    errorMessages: { min: "Please enter a positive number" },
    width: "250px",
  },
  {
    name: "tunTemp",
    label: "Tun temp",
    type: "numberWithUnits",
    modalStep: 0,
    tableOptions: displayFalse,
    convertOnUnitChange: true,
    preferredUnitKeyField: "mashUuid",
    validation: { min: 0 },
    errorMessages: { min: "Please enter a positive number" },
    width: "250px",
  },
  {
    name: "spargeTemp",
    label: "Sparge temp",
    type: "numberWithUnits",
    modalStep: 0,
    tableOptions: displayFalse,
    convertOnUnitChange: true,
    preferredUnitKeyField: "mashUuid",
    validation: { min: 0 },
    errorMessages: { min: "Please enter a positive number" },
    width: "250px",
  },
  {
    name: "ph",
    label: "ph",
    type: "fakeNumber",
    modalStep: 0,
    tableOptions: displayFalse,
    validation: { min: 0 },
    errorMessages: { min: "Please enter a positive number" },
    width: "250px",
  },
  {
    name: "tunWeight",
    label: "Tun weight",
    type: "numberWithUnits",
    modalStep: 1,
    tableOptions: displayFalse,
    convertOnUnitChange: true,
    preferredUnitKeyField: "mashUuid",
    validation: { min: 0 },
    errorMessages: { min: "Please enter a positive number" },
    width: "250px",
  },
  {
    name: "tunSpecificHeat",
    label: "Tun specific heat",
    type: "numberWithUnits",
    modalStep: 1,
    tableOptions: displayFalse,
    convertOnUnitChange: true,
    preferredUnitKeyField: "mashUuid",
    validation: { min: 0 },
    errorMessages: { min: "Please enter a positive number" },
    width: "250px",
  },
  {
    name: "equipAdjust",
    label: "Equipment adjustment",
    type: "switch",
    modalStep: 1,
    defaultChecked: false,
    tableOptions: columnOptions.booleanOptions,
    width: "250px",
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    modalStep: 1,
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
    tableOptions: displayFalse,
    convertOnUnitChange: true,
    preferredUnitKeyField: "mashUuid",
    allowNegative: false,
  },
  {
    name: "stepTemp",
    label: "Step temperature",
    modalStep: 1,
    type: "numberWithUnits",
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
    convertOnUnitChange: true,
    preferredUnitKeyField: "mashUuid",
    allowNegative: false,
  },
  {
    name: "rampTime",
    label: "Ramp time",
    modalStep: 1,
    type: "numberWithUnits",
    tableOptions: displayFalse,
    validation: {
      min: 0,
    },
    errorMessages: {
      min: "Please enter a positive number",
    },
    convertOnUnitChange: true,
    preferredUnitKeyField: "mashUuid",
    allowNegative: false,
  },
  {
    name: "endTemp",
    label: "End temperature",
    modalStep: 1,
    type: "numberWithUnits",
    tableOptions: displayFalse,
    validation: {
      min: 0,
    },
    errorMessages: {
      min: "Please enter a positive number",
    },
    convertOnUnitChange: true,
    preferredUnitKeyField: "mashUuid",
    allowNegative: false,
  },
];

const primaryEntity = {
  entityName: "mash",
  pluralEntityName: "mashes",
  pathName: "mashes",
  entityKey: "mashUuid",
  inputList: mashInputs,
  title: "mash",
  pluralTitle: "mashes",
};
const secondaryEntity = {
  entityName: "mashStep",
  pluralEntityName: "mashSteps",
  pathName: "mash_steps",
  entityKey: "mashStepUuid",
  dependency: "mashUuid",
  inputList: mashStepInputs,
  title: "mash step",
  pluralTitle: "mash steps",
};

const Mashes = entityPageWithNestedEntityCreationFactory<MashData>({
  primaryEntity,
  secondaryEntity,
});

export default Mashes;
