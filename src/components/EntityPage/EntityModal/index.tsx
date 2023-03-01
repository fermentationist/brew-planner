import FormModal, { FormInputOptions } from "../../../components/FormModal";

const EntityModal = ({
  showModal,
  closeModal,
  mode,
  data,
  onSubmit,
  inputList,
  title
}: {
  showModal: boolean;
  closeModal: () => void;
  mode: "create" | "edit";
  data?: any;
  onSubmit: (formData: any) => void;
  inputList: FormInputOptions[];
  title: string;
}) => {
  // add defaultValues from existing data (present if in "edit" mode)
  const formInputs: FormInputOptions[] = inputList.map((input) => {
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
      title={title}
      mode={mode}
      formId="yeastForm"
      onSubmit={onSubmit}
      inputs={formInputs}
    />
  );
};

export default EntityModal;
