import {useEffect} from "react";
import FormModal, { InputParams } from "../../../components/FormModal";
import {v1 as createUuid} from "uuid";
import useConvert from "../../../hooks/useConvert";
import useGlobalState from "../../../hooks/useGlobalState";

const BrewhouseModal = ({
  showModal,
  closeModal,
  mode = "create",
  data
}: {
  showModal: boolean;
  closeModal: () => void;
  mode: "create" | "edit";
  data?: any;
}) => {
  const {applyUnitConversionsToInputList} = useConvert();
  const [globalState, setGlobalState] = useGlobalState();
  useEffect(() => {
    setGlobalState({
      ...globalState,
      preferredUnits: {
        ...globalState.preferredUnits,
        tunSpecificHeat: "J/kg*C"
      }
    })
  }, []);
  const onSubmit = payload => console.log("onSubmit:", payload);
  
  const requiredMessage = { required: "required field" };
  const formInputs: InputParams[] = [
    {
      name: "name",
      label: "Name",
      defaultValue: data?.name,
      validation: {required: true},
      errorMessages: requiredMessage,
      width: "250px",
      convert: false
    },
    {
      name: "batchSize", 
      label: "Batch Volume",
      type: "number",
      step: "0.01",
      defaultValue: data?.batchSize,
      validation: {required: true},
      errorMessages: requiredMessage,
      width: "250px",
      convert: true
    },
    {
      name: "tunVolume", 
      label: "Mash Tun Volume",
      type: "number",
      step: "0.01",
      defaultValue: data?.tunVolume,
      validation: {required: true},
      errorMessages: requiredMessage,
      width: "250px",
      convert: true
    },
    {
      name: "tunWeight", 
      label: "Mash Tun Weight",
      type: "number",
      step: "0.01",
      defaultValue: data?.tunWeight,
      validation: {required: true},
      errorMessages: requiredMessage,
      width: "250px",
      convert: true
    },
    {
      name: "tunLoss", 
      label: "Mash Tun Loss Volume",
      type: "number",
      step: "0.01",
      defaultValue: data?.tunLoss || 0,
      width: "250px",
      convert: true
    },
    {
      name: "tunSpecificHeat", 
      label: "Mash Tun Specific Heat",
      type: "number",
      step: "0.01",
      defaultValue: data?.tunSpecificHeat,
      validation: {required: true},
      errorMessages: requiredMessage,
      width: "250px",
      convert: true
    }
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

  const formInputsWithConversions = applyUnitConversionsToInputList(formInputs);
  console.log("formInputsWithConversions", formInputsWithConversions)
  return (
    <FormModal
      showModal={showModal}
      closeModal={closeModal}
      title="Brewhouse"
      mode={mode}
      formId="brewhouseForm"
      onSubmit={onSubmit}
      inputs={formInputsWithConversions}
    />
  );
};

export default BrewhouseModal;
