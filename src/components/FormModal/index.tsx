import { useState, useCallback, memo, FormEvent } from "react";
import CustomDialog from "../CustomDialog";
import ReactHookForm, {
  FormInputOptions as InputOptions,
} from "../ReactHookForm";
import MuiLoadingButton from "@mui/lab/LoadingButton";
import MuiButton from "@mui/material/Button";
import { styled as muiStyled } from "@mui/material/styles";

export type FormInputOptions = InputOptions;

const LoadingButton = muiStyled(MuiLoadingButton)`
  margin: 1em;
`;

const Button = muiStyled(MuiButton)`
  margin: 1em;
`;

const StyledDialog = muiStyled(CustomDialog)`
  padding: 0.5em;
`;

const FormModal = ({
  mode,
  showModal,
  closeModal,
  inputs,
  formId,
  title,
  onSubmit,
}: {
  mode?: "create" | "edit";
  showModal: boolean;
  closeModal: () => void;
  inputs: FormInputOptions[];
  formId: string;
  title?: string;
  onSubmit: (formData: any) => any;
}) => {
  const [buttonLoadingState, setButtonLoadingState] = useState(false);
  const [modalStep, setModalStep] = useState(0);
  const [formOutput, setFormOutput] = useState({});
  const divideIntoPages = (inputsToDivide: FormInputOptions[]) => {
    const pages = inputsToDivide.reduce((output, input) => {
      const inputStep = input.modalStep ?? 0;
      if (!output[inputStep]) {
        output[inputStep] = [input];
      } else {
        output[inputStep].push(input);
      }
      return output;
    }, {} as Record<string, any[]>);
    return Object.values(pages);
  };

  const [inputPages, setInputPages] = useState(divideIntoPages(inputs));

  const finalSubmitWrapper = (onSubmitFn: (val: any) => any) => {
    return (formData: any) => {
      setButtonLoadingState(true);
      try {
        const output = { 
          ...formData,
          ...formOutput,
        };
        return onSubmitFn(output);
      } catch (error) {
        console.error(error);
      } finally {
        setTimeout(() => {
          setButtonLoadingState(false);
        }, 250);
      }
    };
  };

  const updateDefaultValues = (formData: any) => {
    const updatedInputs = [...inputs].map((input) => {
      if (input.name && formData[input.name]) {
        return {
          ...input,
          defaultValue: formData[input.name],
        };
      }
      return input;
    });
    setInputPages(divideIntoPages(updatedInputs));
  }

  const onBack = (formData: any) => {
    const merged = { ...formOutput, ...formData }
    // update form output with data from current step
    setFormOutput(merged);
    // update default values, so that if the user goes back on multi-step form, the values are still there
    updateDefaultValues(merged);
    setModalStep(modalStep - 1);
  }

  const onNext = (formData: any) => {
    const merged = { ...formOutput, ...formData }
    // update form output with data from current step
    setFormOutput(merged);
    // update default values, so that if the user goes back on multi-step form, the values are still there
    updateDefaultValues(merged);
    // go to next step
    setModalStep(modalStep + 1);
  };

  // const formSubmitFn =
  //   modalStep === inputPages.length - 1 ? finalSubmitWrapper(onSubmit) : onNext;

  const formSubmitFn = (formData: any, event: FormEvent) => {
    console.log("submitter: ", (event.nativeEvent as SubmitEvent).submitter);
    const action = (event.nativeEvent as SubmitEvent).submitter?.dataset?.action;
    switch (action) {
      case "back":
        onBack(formData);
        break;
      case "next":
        onNext(formData);
        break;
      case "submit":
        finalSubmitWrapper(onSubmit)(formData);
        break;
      default:
        break;
    }
  }

  const form = inputPages.length ? (
    <>
      <ReactHookForm
        onSubmit={formSubmitFn}
        formId={`${formId}-${modalStep}`}
        inputs={inputPages[modalStep]}
      />

      {modalStep > 0 ? (
        <>
          <Button
            form={`${formId}-${modalStep}`}
            variant="contained"
            type="submit"
            data-action="back"
          >
            Back
          </Button>
        </>
      ) : null}
      {modalStep < inputPages.length - 1 ? (
        <Button
          type="submit"
          form={`${formId}-${modalStep}`}
          variant="contained"
          data-action="next"
        >
          Next
        </Button>
      ) : (
        <LoadingButton
          type="submit"
          form={`${formId}-${modalStep}`}
          variant="contained"
          loading={buttonLoadingState}
          data-action="submit"
        >
          Save
        </LoadingButton>
      )}
    </>
  ) : null;

  return (
    <StyledDialog
      showDialog={showModal}
      closeDialog={useCallback(closeModal, [closeModal])}
      title={
        (mode ? mode[0].toUpperCase() + mode.slice(1) : "") +
        (title ? " " + title : "")
      }
    >
      {
        inputPages.length ? (
          <>
            {modalStep % 2 === 0 ? (form): ({...form})}
          </>
        ) : null
      }
      <Button onClick={closeModal}>Cancel</Button>
    </StyledDialog>
  );
};

export default memo(FormModal, () => true);
