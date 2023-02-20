import FormModal, { FormInputOptions } from "../../../components/FormModal";

const required = { required: true };
const requiredMessage = { required: "required field" };
const positiveNumber = { min: 0 };
const positiveNumberMessage = { min: "Please enter a positive number" };
// creating input list outside of component so it can be exported for use in creating table columns for Water Profiles table
export const waterInputs = [
  {
    name: "name",
    label: "Name",
    type: "text",
    validation: required,
    errorMessages: requiredMessage,
    width: "250px",
  },
  {
    name: "calcium",
    label: "Calcium",
    type: "numberWithUnits",
    validation: positiveNumber,
    errorMessages: positiveNumberMessage,
    converUnitOnChange: true,
    preferredUnitKeyField: "waterUuid",
    width: "250px",
  },
  {
    name: "bicarbonate",
    label: "Bicarbonate",
    type: "numberWithUnits",
    validation: positiveNumber,
    errorMessages: positiveNumberMessage,
    converUnitOnChange: true,
    preferredUnitKeyField: "waterUuid",
    width: "250px",
  },
  {
    name: "sulfate",
    label: "Sulfate",
    type: "numberWithUnits",
    validation: positiveNumber,
    errorMessages: positiveNumberMessage,
    converUnitOnChange: true,
    preferredUnitKeyField: "waterUuid",
    width: "250px",
  },
  {
    name: "chloride",
    label: "Chloride",
    type: "numberWithUnits",
    validation: positiveNumber,
    errorMessages: positiveNumberMessage,
    converUnitOnChange: true,
    preferredUnitKeyField: "waterUuid",
    width: "250px",
  },
  {
    name: "sodium",
    label: "Sodium",
    type: "numberWithUnits",
    validation: positiveNumber,
    errorMessages: positiveNumberMessage,
    converUnitOnChange: true,
    preferredUnitKeyField: "waterUuid",
    width: "250px",
  },
  {
    name: "magnesium",
    label: "Magnesium",
    type: "numberWithUnits",
    validation: positiveNumber,
    errorMessages: positiveNumberMessage,
    converUnitOnChange: true,
    preferredUnitKeyField: "waterUuid",
    width: "250px",
  },
  {
    name: "ph",
    label: "pH",
    type: "number",
    validation: positiveNumber,
    errorMessages: positiveNumberMessage,
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
];

const WaterModal = ({
  showModal,
  closeModal,
  mode,
  data,
  onSubmit,
}: {
  showModal: boolean;
  closeModal: () => void;
  mode: "create" | "edit";
  data?: any;
  onSubmit: (formData: any) => void;
}) => {
  // add defaultValues from existing data (present if in "edit" mode)
  const formInputs: FormInputOptions[] = waterInputs.map((input) => {
    const inputCopy: FormInputOptions = { ...input };
    inputCopy.defaultValue = data?.[input.name] ?? inputCopy.defaultValue;
    if (inputCopy.preferredUnitKeyField) {
      inputCopy.preferredUnitKey =
        data?.[inputCopy.preferredUnitKeyField] || "temp";
    }
    delete inputCopy.tableOptions;
    return inputCopy;
  });

  return (
    <FormModal
      showModal={showModal}
      closeModal={closeModal}
      title="Water Profile"
      mode={mode}
      formId="waterForm"
      onSubmit={onSubmit}
      inputs={formInputs}
    />
  );
};

export default WaterModal;
