import FormModal, { FormInputOptions } from "../../../components/FormModal";

const required = { required: true };
const requiredMessage = { required: "required field" };

// creating input list outside of component so it can be exported for use in creating table columns for Brewhouses table
export const hopInputs = [
  {
    name: "name",
    label: "Name",
    type: "text",
    validation: required,
    errorMessages: requiredMessage,
    width: "250px",
  },
  {
    name: "alpha",
    label: "Alpha acids (%)",
    type: "number",
    validation: required,
    errorMessages: requiredMessage,
    width: "250px",
  },
  {
    name: "beta",
    label: "Beta acids (%)",
    type: "number",
    width: "250px",
    tableOptions: {
      display: false,
    },
  },
  {
    name: "form",
    label: "Form",
    type: "select",
    selectOptions: ["Pellet", "Plug", "Leaf"],
    selectRestricted: true,
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
    name: "humulene",
    label: "Humulene (%)",
    type: "number",
    width: "250px",
    tableOptions: {
      display: false,
    },
  },
  {
    name: "caryophyllene",
    label: "Caryophyllene (%)",
    type: "number",
    width: "250px",
    tableOptions: {
      display: false,
    },
  },
  {
    name: "cohumulone",
    label: "Cohumulone (%)",
    type: "number",
    width: "250px",
    tableOptions: {
      display: false,
    },
  },
  {
    name: "myrcene",
    label: "Myrcene (%)",
    type: "number",
    width: "250px",
    tableOptions: {
      display: false,
    },
  },
  
];

const HopModal = ({
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
  const formInputs: FormInputOptions[] = hopInputs.map((input) => {
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
      title="Hop"
      mode={mode}
      formId="hopForm"
      onSubmit={onSubmit}
      inputs={formInputs}
    />
  );
};

export default HopModal;
