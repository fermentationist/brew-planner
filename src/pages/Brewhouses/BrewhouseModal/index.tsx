import FormModal, { FormInputOptions } from "../../../components/FormModal";

const required = { required: true };
const requiredMessage = { required: "required field" };

// creating input list outside of component so it can be exported for use in creating table columns for Brewhouses table
export const brewhouseInputs = [
  {
    name: "name",
    label: "Name",
    type: "text",
    validation: required,
    errorMessages: requiredMessage,
    width: "250px",
  },
  {
    name: "batchSize",
    label: "Batch Volume",
    type: "numberWithUnits",
    convertOnUnitChange: true,
    validation: required,
    errorMessages: requiredMessage,
    maxDecPlaces: 2,
    preferredUnitKeyField: "brewhouseUuid",
    width: "250px",
  },
  {
    name: "kettleVol",
    label: "Kettle Volume",
    type: "numberWithUnits",
    convertOnUnitChange: true,
    validation: required,
    errorMessages: requiredMessage,
    maxDecPlaces: 2,
    preferredUnitKeyField: "brewhouseUuid",
    width: "250px",
    tableOptions: {
      display: false,
    },
  },
  {
    name: "tunVolume",
    label: "Mash Tun Volume",
    type: "numberWithUnits",
    convertOnUnitChange: true,
    validation: required,
    errorMessages: requiredMessage,
    maxDecPlaces: 2,
    preferredUnitKeyField: "brewhouseUuid",
    width: "250px",
    tableOptions: {
      display: false,
    },
  },
  {
    name: "tunWeight",
    label: "Mash Tun Weight",
    type: "numberWithUnits",
    convertOnUnitChange: true,
    validation: required,
    errorMessages: requiredMessage,
    maxDecPlaces: 2,
    preferredUnitKeyField: "brewhouseUuid",
    width: "250px",
    tableOptions: {
      display: false,
    },
  },
  {
    name: "tunLoss",
    label: "Mash Tun Loss",
    type: "numberWithUnits",
    convertOnUnitChange: true,
    maxDecPlaces: 2,
    preferredUnitKeyField: "brewhouseUuid",
    width: "250px",
    tableOptions: {
      display: false,
    },
  },
  {
    name: "tunSpecificHeat",
    label: "Mash Tun Specific Heat",
    type: "numberWithUnits",
    convertOnUnitChange: true,
    defaultValue: 300,
    validation: required,
    errorMessages: requiredMessage,
    maxDecPlaces: 2,
    preferredUnitKeyField: "brewhouseUuid",
    width: "250px",
    tableOptions: {
      display: false,
    },
  },
  {
    name: "lauterDeadspace",
    label: "Lauter Tun Loss",
    type: "numberWithUnits",
    convertOnUnitChange: true,
    maxDecPlaces: 2,
    preferredUnitKeyField: "brewhouseUuid",
    width: "250px",
    tableOptions: {
      display: false,
    },
  },
  {
    name: "topUpWater",
    label: "Top Up Water",
    type: "numberWithUnits",
    convertOnUnitChange: true,
    maxDecPlaces: 2,
    preferredUnitKeyField: "brewhouseUuid",
    width: "250px",
    tableOptions: {
      display: false,
    },
  },
  {
    name: "trubChillerLoss",
    label: "Post Boil Loss",
    type: "numberWithUnits",
    convertOnUnitChange: true,
    maxDecPlaces: 2,
    preferredUnitKeyField: "brewhouseUuid",
    width: "250px",
    tableOptions: {
      display: false,
    },
  },
  {
    name: "evaporationRate",
    label: "Evaporation Rate",
    type: "numberWithUnits",
    convertOnUnitChange: true,
    validation: required,
    errorMessages: requiredMessage,
    maxDecPlaces: 2,
    preferredUnitKeyField: "brewhouseUuid",
    width: "250px",
    tableOptions: {
      display: false,
    },
  },
  {
    name: "miscLoss",
    label: "Miscellaneous Loss",
    type: "numberWithUnits",
    convertOnUnitChange: true,
    width: "250px",
    maxDecPlaces: 2,
    preferredUnitKeyField: "brewhouseUuid",
    tableOptions: {
      display: false,
    },
  },
  {
    name: "extractEfficiency",
    label: "Extract Efficiency (%)",
    type: "number",
    defaultValue: 75,
    validation: { required: true, min: 0, max: 100 },
    errorMessages: {
      ...requiredMessage,
      min: "The minimum allowed value is 0",
      max: "The maximum allowed value is 100",
    },
    width: "250px",
  },

  {
    name: "grainAbsorptionRate",
    label: "Grain Absorption Rate",
    type: "numberWithUnits",
    convertOnUnitChange: true,
    defaultValue: 2.5,
    maxDecPlaces: 2,
    preferredUnitKeyField: "brewhouseUuid",
    tableOptions: {
      display: false,
    },
  },
  {
    name: "hopUtilization",
    label: "Hop Utilization (%)",
    type: "number",
    defaultValue: 75,
    maxDecPlaces: 2,
    tableOptions: {
      display: false,
    },
  },
];

const BrewhouseModal = ({
  showModal,
  closeModal,
  mode,
  data,
  onSubmit
}: {
  showModal: boolean;
  closeModal: () => void;
  mode: "create" | "edit";
  data?: any;
  onSubmit: (formData: any) => void;
}) => {
  // add defaultValues from existing data (present if in "edit" mode)
  const formInputs: FormInputOptions[] = brewhouseInputs.map((input) => {
    const inputCopy: FormInputOptions = { ...input };
    inputCopy.defaultValue = data?.[input.name] ?? input.defaultValue;
    if (inputCopy.preferredUnitKeyField) {
      inputCopy.preferredUnitKey = data?.[input.preferredUnitKeyField] || "temp";
    }
    delete inputCopy.tableOptions;
    return inputCopy;
  });

  return (
    <FormModal
      showModal={showModal}
      closeModal={closeModal}
      title="Brewhouse"
      mode={mode}
      formId="brewhouseForm"
      onSubmit={onSubmit}
      inputs={formInputs}
    />
  );
};

export default BrewhouseModal;
