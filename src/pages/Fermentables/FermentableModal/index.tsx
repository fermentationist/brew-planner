import FormModal, { FormInputOptions } from "../../../components/FormModal";

const required = { required: true };
const requiredMessage = { required: "required field" };

// creating input list outside of component so it can be exported for use in creating table columns for Brewhouses table
export const fermentableInputs = [
  {
    name: "name",
    label: "Name",
    type: "text",
    validation: required,
    errorMessages: requiredMessage,
    width: "250px",
  },
  {
    name: "type",
    label: "Type",
    type: "select",
    selectOptions: ["Grain", "Sugar", "Extract", "Dry Extract", "Adjunct"],
    selectRestricted: true,
    validation: required,
    errorMessages: requiredMessage,
    width: "250px",
  },
  {
    name: "yield",
    label: "Yield (%)",
    type: "number",
    validation: required,
    errorMessages: requiredMessage,
    maxDecPlaces: 2,
    width: "250px",
  },
  {
    name: "color",
    label: "Color (SRM)",
    type: "number",
    validation: required,
    errorMessages: requiredMessage,
    width: "250px",
  },
  {
    name: "origin",
    label: "Origin",
    type: "text",
    width: "250px",
    tableOptions: {
      display: false,
    },
  },
  {
    name: "supplier",
    label: "Supplier",
    type: "text",
    width: "250px",
    tableOptions: {
      display: false,
    },
  },
  {
    name: "coarseFineDiff",
    label: "Coarse/Fine Difference (%)",
    type: "number",
    width: "250px",
    tableOptions: {
      display: false,
    },
  },
  {
    name: "moisture",
    label: "Moisture (%)",
    type: "number",
    width: "250px",
    tableOptions: {
      display: false
    }
  },
  {
    name: "disataticPower",
    label: "Diastatic power (ºL)",
    type: "number",
    width: "250px",
    tableOptions: {
      display: false
    }
  },
  {
    name: "protein",
    label: "Protein (%)",
    type: "number",
    width: "250px",
    tableOptions: {
      display: false
    }
  },
  {
    name: "maxInBatch",
    label: "Max per batch (%)",
    type: "number",
    width: "250px",
    tableOptions: {
      display: false
    }
  },
  {
    name: "recommendedMash",
    label: "Mash recommended",
    type: "select",
    selectOptions: ["true", "false"],
    transform: (val?: string) => val === "true" ? true : val === "false" ? false : val,
    selectRestricted: true,
    width: "250px",
    tableOptions: {
      display: false
    }
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    width: "250px",
    tableOptions: {
      display: false
    }
  },
  {
    name: "addAfterBoil",
    label: "Add post-boil",
    type: "select",
    selectOptions: ["true", "false"],
    selectRestricted: true,
    transform: (val?: string) => val === "true" ? true : val === "false" ? false : val,
    width: "250px",
    tableOptions: {
      display: false
    }
  }
];

const FermentableModal = ({
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
  const formInputs: FormInputOptions[] = fermentableInputs.map((input) => {
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
      title="Fermentable"
      mode={mode}
      formId="fermentableForm"
      onSubmit={onSubmit}
      inputs={formInputs}
    />
  );
};

export default FermentableModal;
