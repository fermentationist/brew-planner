import FormModal, { FormInputOptions } from "../../../components/FormModal";

const BrewhouseModal = ({
  showModal,
  closeModal,
  mode = "create",
  data,
}: {
  showModal: boolean;
  closeModal: () => void;
  mode: "create" | "edit";
  data?: any;
}) => {
  const required = { required: true };
  const requiredMessage = { required: "required field" };
  const formInputs: FormInputOptions[] = [
    {
      name: "name",
      label: "Name",
      defaultValue: data?.name,
      validation: required,
      errorMessages: requiredMessage,
      width: "250px",
      convert: false,
    },
    {
      name: "batchSize",
      label: "Batch Volume",
      type: "withUnits",
      defaultValue: data?.batchSize || 10,
      validation: required,
      errorMessages: requiredMessage,
      width: "250px",
      convert: true,
      callback: x => console.log("x",x) || x
    },
    {
      name: "kettleVol",
      label: "Kettle Volume",
      type: "withUnits",
      defaultValue: data?.kettleVol || 1,
      validation: required,
      errorMessages: requiredMessage,
      width: "250px",
      convert: true,
    },
    {
      name: "tunVolume",
      label: "Mash Tun Volume",
      type: "withUnits",
      defaultValue: data?.tunVolume || 1,
      validation: required,
      errorMessages: requiredMessage,
      width: "250px",
      convert: true,
    },
    {
      name: "tunWeight",
      label: "Mash Tun Weight",
      type: "withUnits",
      defaultValue: data?.tunWeight || 1,
      validation: required,
      errorMessages: requiredMessage,
      width: "250px",
      convert: true,
    },
    {
      name: "tunLoss",
      label: "Mash Tun Loss",
      type: "withUnits",
      defaultValue: data?.tunLoss || 1,
      width: "250px",
      convert: true,
    },
    {
      name: "tunSpecificHeat",
      label: "Mash Tun Specific Heat",
      type: "withUnits",
      defaultValue: data?.tunSpecificHeat || 1,
      validation: required,
      errorMessages: requiredMessage,
      width: "250px",
      convert: true,
    },
    {
      name: "lauterDeadspace",
      label: "Lauter Tun Loss",
      type: "withUnits",
      defaultValue: data?.lauterDeadspace || 1,
      width: "250px",
      convert: true,
    },
    {
      name: "topUpWater",
      label: "Top Up Water",
      type: "withUnits",
      defaultValue: data?.topUpWater || 1,
      width: "250px",
      convert: true,
    },
    {
      name: "trubChillerLoss",
      label: "Post Boil Loss",
      type: "withUnits",
      defaultValue: data?.trubChillerLoss || 1,
      width: "250px",
      convert: true,
    },
    {
      name: "evaporationRate",
      label: "Evaporation Rate",
      type: "withUnits",
      defaultValue: data?.evaporationRate || 1,
      validation: required,
      errorMessages: requiredMessage,
      width: "250px",
      convert: true,
    },
    {
      name: "miscLoss",
      label: "Miscellaneous Loss",
      type: "withUnits",
      defaultValue: data?.miscLoss || 1,
      width: "250px",
      convert: true,
    },
    {
      name: "extractEfficiency",
      label: "Extract Efficiency (%)",
      type: "number",
      step: "0.01",
      defaultValue: data?.extractEfficiency || 1,
      validation: { required: true, min: 0, max: 100 },
      errorMessages: {
        ...requiredMessage,
      min: "The minimum allowed value is 0",
      max: "The maximum allowed value is 100"
    },
      width: "250px",
      callback: (x) => Number(x),
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

  // useEffect(() => {
  //   const formInputsWithConversions = applyUnitConversionsToInputList(inputs);
  //   console.log("formInputsWithConversions", formInputsWithConversions)
  //   setFormInputs(formInputsWithConversions);
  // }, [refreshNum]);

  const onSubmit = (payload) => console.log("onSubmit:", payload);

  // const refresh = () => {
  //   console.log("refresh called");
  //   setRefreshNum(Math.random());
  // };

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
