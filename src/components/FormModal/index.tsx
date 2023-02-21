import { Ref, useState, useCallback, memo } from "react";
import CustomDialog from "../CustomDialog";
import ReactHookForm, {
  FormInputOptions as InputOptions,
} from "../ReactHookForm";
import MuiButton from "@mui/lab/LoadingButton";
import { styled as muiStyled } from "@mui/material/styles";

export type FormInputOptions = InputOptions;

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

  const onSubmitWrapper = (onSubmitFn: (val: any) => any) => {
    return (formData: any) => {
      setButtonLoadingState(true);
      try {
        return onSubmitFn(formData);
      } catch (error) {
        console.error(error);
      } finally {
        setTimeout(() => {
          setButtonLoadingState(false);
        }, 250);
      }
    };
  };

  return (
    <StyledDialog
      showDialog={showModal}
      closeDialog={useCallback(closeModal, [])}
      title={
        (mode ? mode[0].toUpperCase() + mode.slice(1) : "") +
        (title ? " " + title : "")
      }
    >
      <ReactHookForm
        onSubmit={onSubmitWrapper(onSubmit)}
        formId={formId}
        inputs={inputs}
      />
      <Button
        type="submit"
        form={formId}
        variant="contained"
        loading={buttonLoadingState}
      >
        Save
      </Button>
      <Button onClick={closeModal}>Cancel</Button>
    </StyledDialog>
  );
};

export default memo(FormModal, () => true);
