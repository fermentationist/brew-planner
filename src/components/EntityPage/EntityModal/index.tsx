import FormModal, { FormInputOptions } from "../../../components/FormModal";

const EntityModal = ({
  showModal,
  closeModal,
  mode,
  data,
  onSubmit,
  inputList,
  title,
  formId,
  refresh,
}: {
  showModal: boolean;
  closeModal: () => void;
  mode: "create" | "edit";
  data?: any;
  onSubmit: (formData: any) => void;
  inputList: FormInputOptions[];
  title: string;
  formId?: string;
  refresh?: () => void;
}) => {
  // add defaultValues from existing data (present if in "edit" mode)
  const formInputs: FormInputOptions[] = inputList.map((input) => {
    const inputCopy = { ...input } as FormInputOptions;
    inputCopy.defaultValue = data?.[input.name] ?? inputCopy.defaultValue;
    if (Object.hasOwnProperty.call(inputCopy, "defaultChecked")) {
      inputCopy.defaultChecked =
        data?.[input.name] ?? inputCopy.defaultChecked;
    }
    if (inputCopy.preferredUnitKeyField) {
      inputCopy.preferredUnitKey =
        data?.[inputCopy.preferredUnitKeyField] || "temp";
    }
    delete inputCopy.tableOptions;
    return inputCopy;
  });
  
  const refreshOnClose = () => {
    refresh && refresh();
    closeModal();
  }

  return (
    <FormModal
      showModal={showModal}
      closeModal={refreshOnClose}
      title={title}
      mode={mode}
      formId={formId ?? `${mode}-${title}-form`}
      onSubmit={onSubmit}
      inputs={formInputs}
    />
  );
};

export default EntityModal;
