import FormModal, { FormInputOptions } from "../../../components/FormModal";

const required = { required: true };
const requiredMessage = { required: "required field" };
// creating input list outside of component so it can be exported for use in creating table columns for Miscs table
export const miscInputs = [
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
    selectOptions: ["Spice", "Fining", "Water Agent", "Herb", "Flavor", "Other"],
    selectRestricted: true,
    validation: required,
    errorMessages: requiredMessage,
    width: "250px",
  },
  {
    name: "useFor",
    label: "Recommended use",
    type: "text",
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
      display: false,
    },
  },
  
];

const MiscModal = ({
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
  const formInputs: FormInputOptions[] = miscInputs.map((input) => {
    const inputCopy = { ...input } as FormInputOptions;
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
      title="Miscellaneous Addition"
      mode={mode}
      formId="miscForm"
      onSubmit={onSubmit}
      inputs={formInputs}
    />
  );
};

export default MiscModal;
