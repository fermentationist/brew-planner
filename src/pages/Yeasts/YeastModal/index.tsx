import FormModal, { FormInputOptions } from "../../../components/FormModal";

const required = { required: true };
const requiredMessage = { required: "required field" };
const percentage = { min: 0, max: 100 };
const percentageMessage = { min: "Please enter a valid percentage (>= 0)", max: "Please enter a valid percentage (<= 100)" };
// creating input list outside of component so it can be exported for use in creating table columns for Yeasts table
export const yeastInputs = [
  {
    name: "name",
    label: "Name",
    type: "text",
    validation: {...required, maxLength: 100},
    errorMessages: {...requiredMessage, maxLength: "Maximum length - 100 characters"},
    width: "250px",
  },
  {
    name: "type",
    label: "Type",
    type: "select",
    selectOptions: ["Ale", "Lager", "Wheat", "Wine", "Champagne", "Kveik"],
    selectRestricted: true,
    validation: required,
    errorMessages: requiredMessage,
    width: "250px",
  },
  {
    name: "laboratory",
    label: "Manufacturer",
    type: "text",
    width: "250px",
    validation: {maxLength: 100},
    errorMessages: {maxLength: "Maximum length - 100 characters"},
  },
  {
    name: "productId",
    label: "Product ID",
    type: "text",
    validation: {maxLength: 36},
    errorMessages: {maxLength: "Maximum length - 36 characters"},
    width: "250px",
  },
  {
    name: "minTemperature",
    label: "Min temperature",
    type: "number",
    width: "250px",
    tableOptions: {
      display: false,
    },
  },
  {
    name: "maxTemperature",
    label: "Max temperature",
    type: "number",
    width: "250px",
    tableOptions: {
      display: false,
    },
  },
  {
    name: "flocculation",
    label: "Flocculation",
    type: "select",
    selectOptions: ["Low", "Medium", "High", "Very High"],
    selectRestricted: true,
    width: "250px",
    tableOptions: {
      display: false,
    },
  },
  {
    name: "attenuation",
    label: "Attenuation (%)",
    type: "number",
    width: "250px",
    validation: percentage,
    errorMessages: percentageMessage,
    tableOptions: {
      display: false,
    },
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
  {
    name: "bestFor",
    label: "Styles",
    type: "text",
    width: "250px",
    tableOptions: {
      display: false,
    },
  },
  {
    name: "maxReuse",
    label: "Max repitches",
    type: "number",
    step: 1,
    width: "250px",
    validation: {min: 0},
    errorMessages: {min: "Please enter a positive integer"},
    tableOptions: {
      display: false,
    },
  },
  
];

const YeastModal = ({
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
  const formInputs: FormInputOptions[] = yeastInputs.map((input) => {
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
      title="Yeast"
      mode={mode}
      formId="yeastForm"
      onSubmit={onSubmit}
      inputs={formInputs}
    />
  );
};

export default YeastModal;
