import { useState, useCallback, memo } from "react";
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
  numSteps = 1,
}: {
  mode?: "create" | "edit";
  showModal: boolean;
  closeModal: () => void;
  inputs: FormInputOptions[];
  formId: string;
  title?: string;
  onSubmit: (formData: any) => any;
  numSteps?: number;
}) => {
  const [buttonLoadingState, setButtonLoadingState] = useState(false);
  const [modalStep, setModalStep] = useState(0);
  const [formOutput, setFormOutput] = useState({});
  console.log("numSteps: ", numSteps);
  const divideIntoPages = useCallback((inputsToDivide: FormInputOptions[]) => {
    const pages = inputsToDivide.reduce((output, input) => {
      const inputStep = input.modalStep ?? 0;
      console.log("inputStep: ", inputStep);
      if (!output[inputStep]) {
        output[inputStep] = [input];
      } else {
        output[inputStep].push(input);
      }
      return output;
    }, {} as Record<string, any[]>);
    const pageArray = [];
    for (let i = 0; i < numSteps; i++) {
      console.log("i: ", i);
      console.log("pages[i]: ", pages[i] ?? "")
      pageArray.push(pages[i] ?? []);
    }
    return pageArray;
  }, [numSteps]);
  
  const [inputPages] = useState(divideIntoPages(inputs));

  console.log("inputPages: ", inputPages);
  const onSubmitWrapper = (onSubmitFn: (val: any) => any) => {
    return (formData: any) => {
      setButtonLoadingState(true);
      try {
        const output = { ...formOutput, ...formData };
        setFormOutput(output);
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
    setFormOutput({ ...formOutput, ...formData });
    setModalStep(modalStep + 1);
  };

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
            <ReactHookForm
              onSubmit={modalStep === numSteps - 1 ? onSubmitWrapper(onSubmit) : onNext}
              formId={formId}
              inputs={inputPages[modalStep]}
            />
            {
              modalStep === numSteps - 1 ? (
                <LoadingButton
                  type="submit"
                  form={formId}
                  variant="contained"
                  loading={buttonLoadingState}
                >
                  Save
                </LoadingButton>
              ) : null
            }
            {
              modalStep > 0 ?
              (
                <Button
                  form={formId}
                  variant="contained"
                  onClick={() => setModalStep(modalStep - 1)}
                >
                  Back
                </Button>
              ) : null
            }
            {
              modalStep < numSteps - 1 ?
              (
                <Button
                  type="submit"
                  form={formId}
                  variant="contained"
                >
                  Next
                </Button>
              ) : null
            }
            
          </>
        ) : null
      }
      <Button onClick={closeModal}>Cancel</Button>
    </StyledDialog>
  );
};

export default memo(FormModal, () => true);
