import FormModal, { FormInputOptions } from "../../../components/FormModal";

export interface BrewhouseForm {
  name?: string;
  batchSize?: number;
  kettleVol?: number;
  tunVolume?: number;
  tunWeight?: number;
  tunLoss?: number;
  tunSpecificHeat?: number;
  lauterDeadspace?: number;
  topUpWater?: number;
  trubChillerLoss?: number;
  evaporationRate?: number;
  miscLoss?: number;
  extractEfficiency?: number;
  grainAbsorptionRate?: number;
  hopUtilization?: number;
}

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
  const required = { required: true };
  const requiredMessage = { required: "required field" };
  const formInputs: FormInputOptions[] = [
    {
      name: "name",
      label: "Name",
      type: "text",
      defaultValue: data?.name,
      validation: required,
      errorMessages: requiredMessage,
      width: "250px"
    },
    {
      name: "batchSize",
      label: "Batch Volume",
      type: "numberWithUnits",
      convertOnUnitChange: false,
      defaultValue: data?.batchSize,
      validation: required,
      errorMessages: requiredMessage,
      maxDecPlaces: 2,
      width: "250px"
    },
    {
      name: "kettleVol",
      label: "Kettle Volume",
      type: "numberWithUnits",
      convertOnUnitChange: true,
      defaultValue: data?.kettleVol ?? 0,
      validation: required,
      errorMessages: requiredMessage,
      maxDecPlaces: 2,
      width: "250px",
    },
    {
      name: "tunVolume",
      label: "Mash Tun Volume",
      type: "numberWithUnits",
      convertOnUnitChange: true,
      defaultValue: data?.tunVolume ?? 0,
      validation: required,
      errorMessages: requiredMessage,
      maxDecPlaces: 2,
      width: "250px",
    },
    {
      name: "tunWeight",
      label: "Mash Tun Weight",
      type: "numberWithUnits",
      convertOnUnitChange: true,
      defaultValue: data?.tunWeight ?? 0,
      validation: required,
      errorMessages: requiredMessage,
      maxDecPlaces: 2,
      width: "250px",
    },
    {
      name: "tunLoss",
      label: "Mash Tun Loss",
      type: "numberWithUnits",
      convertOnUnitChange: true,
      defaultValue: data?.tunLoss ?? 0,
      maxDecPlaces: 2,
      width: "250px",
    },
    {
      name: "tunSpecificHeat",
      label: "Mash Tun Specific Heat",
      type: "numberWithUnits",
      convertOnUnitChange: true,
      defaultValue: data?.tunSpecificHeat ?? 300,
      validation: required,
      errorMessages: requiredMessage,
      maxDecPlaces: 2,
      width: "250px",
    },
    {
      name: "lauterDeadspace",
      label: "Lauter Tun Loss",
      type: "numberWithUnits",
      convertOnUnitChange: true,
      defaultValue: data?.lauterDeadspace ?? 0,
      maxDecPlaces: 2,
      width: "250px",
    },
    {
      name: "topUpWater",
      label: "Top Up Water",
      type: "numberWithUnits",
      convertOnUnitChange: true,
      defaultValue: data?.topUpWater ?? 0,
      maxDecPlaces: 2,
      width: "250px",
    },
    {
      name: "trubChillerLoss",
      label: "Post Boil Loss",
      type: "numberWithUnits",
      convertOnUnitChange: true,
      defaultValue: data?.trubChillerLoss ?? 0,
      maxDecPlaces: 2,
      width: "250px",
    },
    {
      name: "evaporationRate",
      label: "Evaporation Rate",
      type: "numberWithUnits",
      convertOnUnitChange: true,
      defaultValue: data?.evaporationRate ?? 0,
      validation: required,
      errorMessages: requiredMessage,
      maxDecPlaces: 2,
      width: "250px",
    },
    {
      name: "miscLoss",
      label: "Miscellaneous Loss",
      type: "numberWithUnits",
      convertOnUnitChange: true,
      defaultValue: data?.miscLoss ?? 0,
      width: "250px",  
      maxDecPlaces: 2,
    },
    {
      name: "extractEfficiency",
      label: "Extract Efficiency (%)",
      type: "number",
      defaultValue: data?.extractEfficiency ?? 75,
      validation: { required: true, min: 0, max: 100 },
      errorMessages: {
        ...requiredMessage,
        min: "The minimum allowed value is 0",
        max: "The maximum allowed value is 100"
      },
      width: "250px",
    },

    {
      name: "grainAbsorptionRate",
      label: "Grain Absorption Rate",
      type: "numberWithUnits",
      convertOnUnitChange: true,
      defaultValue: data?.grainAbsorptionRate || 2.5,
      maxDecPlaces: 2
    },
    {
      name: "hopUtilization",
      label: "Hop Utilization (%)",
      type: "number",
      defaultValue: data?.hopUtilization || 75,
      maxDecPlaces: 2
    },

    //     "breweryUuid"
    // "brewhouseUuid"
    // "createdBy"
    // "batchSize"
    // "tunVolume"
    // "tunWeight"
    // "tunLoss"
    // "tunSpecificHeat"
    // "lauterDeadspace"
    // "topUpWater"
    // "trubChillerLoss"
    // "evaporationRate"
    // "kettleVol"
    // "miscLoss"
    // "extractEfficiency"
    // "grainAbsorptionRate"
    // "hopUtilization"
  ];

  return (
    <FormModal
      showModal={showModal}
      closeModal={closeModal}
      title="Brewhouse"
      mode={mode}
      formId="brewhouseForm"
      onSubmit={onSubmit}
      inputs={formInputs}
      // refresh={refresh}
    />
  );
};

export default BrewhouseModal;
