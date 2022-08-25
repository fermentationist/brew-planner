import CustomDialog from "../CustomDialog";
import ReactHookForm from "../ReactHookForm";
import CustomTextField from "../CustomTextField";
import MuiButton from "@mui/lab/LoadingButton";
import { styled as muiStyled } from "@mui/material/styles";
import CustomAutocomplete from "../CustomAutocomplete";
import CustomSwitch from "../CustomSwitch";
import { Ref, useRef, createElement, useState, useCallback, FormEvent} from "react";

export interface InputParams {
  name: string; // required - used to register form inputs
  label?: string;
  type?: string; // type of input, i.e. "text", "password", "select" or "switch"
  defaultValue?: any;
  selectOptions?: any[]; // options to be used if the input is a select (CustomAutocomplete) element
  callback?: (val: any) => any; // for inputs like
  selectRestricted?: boolean;
  validation?: {
    [key: string]: string | boolean | number | ((input: any) => boolean);
  };
  errorMessages?: {
    [key: string]: string | ((formErrors: any) => string);
  };
  width?: string;
  ref?: Ref<any>;
  child?: JSX.Element;
  step?: string;
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
  inputs: InputParams[];
  formId: string;
  title?: string;
  onSubmit: (formData: any) => void;
}) => {
  const [buttonLoadingState, setButtonLoadingState] = useState(false);
  const getInitialState = () => {
    // adding keys and defaultValues for the inputs that use callbacks, to the object that will be merged with formData upon submission
    const callbackDefaults = inputs.reduce((map: any, input) => {
      if (input.callback) {
        map[input.name] = input.defaultValue;
      }
      return map;
    }, {});
    return callbackDefaults;
  };
  
  const callbackValuesRef = useRef(getInitialState());

  const callbackWrapper = (cb: (val: any) => any, inputName: string) => {
    return (value: any) => {
      const newValues = {
        ...callbackValuesRef.current,
        [inputName]: cb(value)
      }
      callbackValuesRef.current = newValues;
      return cb(value);
    };
  };

  const onSubmitWrapper = (onSubmitFn: (val: any) => any) => {
    return (partialFormData: any) => {
      setButtonLoadingState(true);
      const formData = {
        ...partialFormData,
        ...callbackValuesRef.current
      };
      try {
        return onSubmitFn(formData);
      } 
      catch (error) {
        console.error(error);
      } 
      finally {
        setTimeout(() => {
          setButtonLoadingState(false);
        }, 750);
      }
    };
  };
  return (
    <StyledDialog
      showDialog={showModal}
      closeDialog={useCallback(closeModal, [])}
      title={(mode ? mode[0].toUpperCase() + mode.slice(1) : "") + (title ? " " + title : "")}
    >
      <ReactHookForm onSubmit={onSubmitWrapper(onSubmit)} formId={formId}>
        {inputs.map((input, index) => {
          if (input.child) {
            return createElement(input.child.type, {
              ...input.child.props,
              callback: input.callback && callbackWrapper(input.callback, input.name),
              key: index
            });
          }
          if (input.type === "select" && input.selectOptions) {
            return (
              <CustomAutocomplete
                name={input.name}
                label={input.label}
                options={input.selectOptions}
                callback={
                  input.callback && callbackWrapper(input.callback, input.name)
                }
                defaultValue={input.defaultValue}
                key={index}
                restricted={input.selectRestricted}
                width={input.width}
                ref={input.ref}
              />
            );
          } else if (input.type === "switch") {
            return (
              <CustomSwitch
                name={input.name}
                label={input.label}
                defaultChecked={input.defaultValue}
                ref={input.ref}
                callback={
                  input.callback && callbackWrapper(input.callback, input.name)
                }
                key={index}
                type={input.type}
                labelPlacement="end"
              />
            );
          } else {
            return (
              <CustomTextField
                type={input.type || "text"}
                internalLabel={input.label || input.name}
                name={input.name}
                step={input.step}
                validation={input.validation}
                errorMessages={input.errorMessages}
                width={input.width}
                key={index}
                defaultValue={input.defaultValue}
                onChange={
                  input.callback
                    ? (event: FormEvent) => {
                        const target = event.currentTarget as HTMLInputElement;
                        const value = target?.value;
                        return callbackWrapper(
                          input.callback,
                          input.name
                        )(value);
                      }
                    : void 0
                }
                ref={input.ref}
              />
            );
          }
        })}
      </ReactHookForm>
      <Button type="submit" form={formId} variant="contained" loading={buttonLoadingState}>
        Save
      </Button>
      <Button onClick={closeModal}>Cancel</Button>
    </StyledDialog>
  );
};

export default FormModal;
