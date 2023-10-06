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
  numSteps = 1,
  submitEachStep,
  stepKeys = [],
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
  numSteps?: number;
  submitEachStep?: boolean;
  stepKeys?: string[];
}) => {
  // add defaultValues from existing data (present if in "edit" mode)
  const formInputs: FormInputOptions[] = inputList.map((input) => {
    const inputCopy = { ...input } as FormInputOptions;
    if (inputCopy.modalStep === 0) {
      inputCopy.defaultValue = data?.[input.name] ?? inputCopy.defaultValue;
      if (Object.hasOwnProperty.call(inputCopy, "defaultChecked")) {
        inputCopy.defaultChecked =
          data?.[input.name] ?? inputCopy.defaultChecked;
      }
      if (inputCopy.preferredUnitKeyField) {
        inputCopy.preferredUnitKey =
          data?.[inputCopy.preferredUnitKeyField] || "temp";
      }
    } else {
      // TODO: find where temp preferredUnitKey is being changed to long-term preferredUnitKey and alter it to account for nested entity creation
      inputCopy.preferredUnitKey = `temp-${inputCopy.modalStep}`
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
      numSteps={numSteps}
      submitEachStep={submitEachStep}
      stepKeys={stepKeys}
    />
  );
};

export default EntityModal;
