import { useState, useCallback, memo, useEffect } from "react";
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

  useEffect(() => {
    console.log("formOutput:", formOutput);
  }, [formOutput]);

  const [inputPages] = useState(divideIntoPages(inputs));

  const finalSubmitWrapper = (onSubmitFn: (val: any) => any) => {
    return (formData: any) => {
      console.log("formData in finalSubmit:", formData);
      setButtonLoadingState(true);
      try {
        console.log("formOutput:", formOutput);
        console.log("formData:", formData);
        const output = { 
          ...formData,
          ...formOutput,
        };
        console.log("output:", output);
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

  const onNext = (formData: any) => {
    console.log("formData in onNext:", formData);
    setFormOutput({ ...formOutput, ...formData });
    setModalStep(modalStep + 1);
  };

  const formSubmitFn =
    modalStep === inputPages.length - 1 ? finalSubmitWrapper(onSubmit) : onNext;

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
            onClick={() => setModalStep(modalStep - 1)}
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
        >
          Next
        </Button>
      ) : (
        <LoadingButton
          type="submit"
          form={`${formId}-${modalStep}`}
          variant="contained"
          loading={buttonLoadingState}
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
