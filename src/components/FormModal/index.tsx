import { Ref, useState, useCallback, ChangeEvent, FunctionComponent, memo} from "react";
import CustomDialog from "../CustomDialog";
import ReactHookForm from "../ReactHookForm";
import MuiButton from "@mui/lab/LoadingButton";
import { styled as muiStyled } from "@mui/material/styles";

export interface FormInputOptions {
  name: string; // required - used to register form inputs
  label?: string;
  type?: string; // type of input, i.e. "text", "password", "select" or "switch"
  defaultValue?: any;
  defaultChecked?: boolean;
  value?: any;
  selectOptions?: any[]; // options to be used if the input is a select (CustomAutocomplete) element
  callback?: (val: any) => any; // for inputs like "select"
  selectRestricted?: boolean;
  validation?: {
    [key: string]: string | boolean | number | ((input: any) => boolean);
  };
  errorMessages?: {
    [key: string]: string | ((formErrors: any) => string);
  };
  width?: string;
  ref?: Ref<any>;
  component?: FunctionComponent;
  componentProps?: Record<string, any>;
  step?: string;
  unitSelections?: {[key: string]: string[]};
  unit?: string;
  transform?: (value: any) => any;
  onChange?: (event: ChangeEvent) => void;
  convertOnUnitChange?: boolean; // applies to "numberWithUnit" inputs
  maxDecPlaces?: number; // will call toFixed(maxDecPlaces) on value
}

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
  onSubmit
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
      title={(mode ? mode[0].toUpperCase() + mode.slice(1) : "") + (title ? " " + title : "")}
    >
      <ReactHookForm onSubmit={onSubmitWrapper(onSubmit)} formId={formId} inputs={inputs}>
      </ReactHookForm>
      <Button type="submit" form={formId} variant="contained" loading={buttonLoadingState}>
        Save
      </Button>
      <Button onClick={closeModal}>Cancel</Button>
    </StyledDialog>
  );
};

export default memo(FormModal, () => true);
