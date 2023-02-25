import { Stack } from "@mui/material";
import React, {
  BaseSyntheticEvent,
  useRef,
  createElement,
  ChangeEvent,
  ComponentPropsWithoutRef,
  memo, 
  Ref,
  FormEvent,
  ComponentType
} from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import CustomTextField, { CustomTextFieldProps } from "../CustomTextField";
import CustomNumberField, {
  CustomNumberFieldProps,
} from "../CustomNumberField";
import CustomNumberFieldWithUnits, {
  CustomNumberFieldWithUnitsProps,
} from "../CustomNumberFieldWithUnits";
import CustomAutocomplete, {
  CustomAutocompleteProps,
} from "../CustomAutocomplete";
import CustomSwitch, { CustomSwitchProps } from "../CustomSwitch";
import FormError from "../FormError";

const COMPONENT_TYPES: Record<string, ComponentType> = {
  text: CustomTextField,
  textarea: CustomTextField,
  number: CustomNumberField,
  select: CustomAutocomplete,
  switch: CustomSwitch,
  numberWithUnits: CustomNumberFieldWithUnits,
};

export interface FormInputOptions {
  name: string; // required - used to register form inputs
  label?: string;
  type?: string; // type of input, i.e. "text", "password", "select" or "switch"
  defaultValue?: any;
  defaultChecked?: boolean;
  value?: any;
  selectOptions?: any[]; // options to be used if the input is a select (CustomAutocomplete) element
  selectRestricted?: boolean;
  selectOptionKey?: string; // if selectOptions are objects, which key to look for option under
  callback?: (val: any) => any; // for inputs like "select"
  validation?: Record<string, any>;
  errorMessages?: Record<string, any>;
  width?: string;
  ref?: Ref<any>;
  component?: ComponentType;
  componentProps?: Record<string, any>;
  step?: string;
  unitSelections?: Record<string, string[]>;
  unit?: string;
  transform?: (value: any) => any;
  onChange?: (event: ChangeEvent) => void;
  convertOnUnitChange?: boolean; // applies to "numberWithUnit" inputs
  maxDecPlaces?: number; // will call toFixed(maxDecPlaces) on value
  tableOptions?: Record<string, any>;
  preferredUnitKey?: string; // a string (like a brewhouseUuid) that is used as a key to save preferred units under in globalState - using it allows different unit preferences for each brewhouse, for example. Used "numberWithUnits" form inputs, to change the preferred units.
  preferredUnitKeyField?: string; // a string (like "brewhouseUuid") that is used to create a key to save preferred units under in globalState - using it allows different unit preferences for each brewhouse, for example. This is used in column definitions generated by useCreateColumnsWithUnitConversion.generateColumnsFromInputs().
}

export interface FormProps {
  onSubmit: (formData: Record<string, any>, event?: BaseSyntheticEvent) => void;
  formId: string;
  inputs: FormInputOptions[];
}

const Container = styled.div`
  margin: 1em;
`;

const Form = function (props: FormProps) {
  const getDefaultValues = (inputs: FormInputOptions[], excludeControlled = false) => {
    return inputs.reduce((map: Record<string, any>, input) => {
      map[input.name] = excludeControlled && input.type === "numberWithUnits" ? void 0 : input.defaultChecked ?? input.defaultValue ?? input.value;
      return map;
    }, {});
  };

  const defaultValues = getDefaultValues(props.inputs, true);
  const callbackValuesRef = useRef(getDefaultValues(props.inputs));
  const {
    handleSubmit,
    register,
    formState,
    setValue: setInputValue,
    trigger: triggerFormValidation,
  } = useForm({ defaultValues });

  const callbackWrapper = (
    cb: (val: any) => any,
    inputName: string,
    transformFn?: (val: any) => any
  ) => {
    return (value: any, callRHFSetValueFn = false) => {
      const transformedValue = transformFn ? transformFn(value) : value;
      if (callRHFSetValueFn) {
        setInputValue(inputName, transformedValue);
      }
      const newValues = {
        ...callbackValuesRef.current,
        [inputName]: transformedValue,
      };
      callbackValuesRef.current = newValues;
      return cb(transformedValue);
    };
  };

  const onSubmitWrapper = (onSubmitFn: (val: any, event?: FormEvent) => any) => {
    return (event: FormEvent, partialFormData: any) => {
      const formData = {
        ...partialFormData,
        ...callbackValuesRef.current,
      };

      return onSubmitFn(formData, event);
    };
  };

  type ComponentProps =
    | CustomAutocompleteProps
    | CustomSwitchProps
    | CustomNumberFieldWithUnitsProps
    | CustomTextFieldProps
    | CustomNumberFieldProps;

  const getProps = (input: FormInputOptions): ComponentProps => {
    // given the input object, return the correct props for the type of component that it prescribes
    let componentProps: ComponentProps = {
      name: input.name,
      type: input.type || "text",
      internalLabel: input.label || input.name,
      step: input.step,
      width: input.width,
      defaultValue:
        input.defaultValue ?? "",
      callback: callbackWrapper(
        input.callback || ((x: any) => x),
        input.name,
        input.transform
      ),
    };

    switch (input.type) {
      case "select":
        componentProps = {
          ...componentProps,
          options: input.selectOptions,
          restricted: input.selectRestricted,
          label: input.label ?? input.name,
          optionKey: input.selectOptionKey,
          defaultValue: typeof input.defaultValue === "boolean" ? String(input.defaultValue) : input.defaultValue 
        } as CustomAutocompleteProps;
        break;

      case "switch":
        componentProps = {
          name: input.name,
          label: input.label,
          defaultChecked: input.defaultChecked ?? input.defaultValue,
          callback: callbackWrapper(
            input.callback || ((x: any) => x),
            input.name,
            input.transform
          ),
          labelPlacement: "end",
        }  as CustomSwitchProps;
        break;

      case "number":
        componentProps = {
          ...componentProps,
          callback: (val: string) => {
            return callbackWrapper(
              input.callback || ((x: any) => x),
              input.name,
              input.transform
            )(Number(val))
          }
        } as CustomNumberFieldProps;
        break;

      case "numberWithUnits":
        componentProps = {
          ...componentProps,
          maxDecPlaces: input.maxDecPlaces,
          convertOnUnitChange: input.convertOnUnitChange,
          defaultValue: input.convertOnUnitChange ? void 0 : input.defaultValue, // defaultValue must be undefined if convertOnUnitChange, because it will then be a controlled input
          value: input.convertOnUnitChange ? input.defaultValue ?? input.value : void 0, // value must be undefined if not convertOnUnitChange, because it will then be an uncontrolled input
          preferredUnitKey: input.preferredUnitKey
        } as CustomNumberFieldWithUnitsProps;
        break;
      
      case "textarea":
        componentProps = {
          ...componentProps,
          multiline: true
        }
    }
    return componentProps;
  };

  const wrappedOnSubmit = onSubmitWrapper(props.onSubmit);

  return (
    <form
      onSubmit={(event) => handleSubmit(wrappedOnSubmit.bind(null, event))(event)}
      id={props.formId}
    >
      <Stack>
        {/* loop through list of inputs and create the specified input components */}
        {props.inputs.map((input: FormInputOptions) => {
          const inputProps = getProps(input);
          const { ref, onChange, onBlur } = register(
            input.name,
            input.validation
          );
          const allProps = {
            ...inputProps,
            ref,
            onBlur,
            onChange: (event: ChangeEvent) => {
              const target = event.target as HTMLInputElement;
              const value =
                input.type === "switch" ? target.checked : target.value;
              setInputValue(input.name, value); 
              input.onChange && input.onChange(event);
              if (Object.keys(formState.errors).length) {
                triggerFormValidation(); // if there are currently validation errors, re-validate form
              }
              return onChange(event);
            },
          };
          return (
            // creating the input component that was defined in the input object
            <Container key={input.name}>
              {input.component
                ? createElement<any>(input.component, {
                    callback: callbackWrapper(
                      input.callback || ((x: any) => x),
                      input.name,
                      input.transform
                    ),
                    ...(input.componentProps || {}),
                  } as ComponentPropsWithoutRef<any>)
                : createElement<any>(
                    COMPONENT_TYPES[input.type] || CustomTextField,
                    allProps as ComponentPropsWithoutRef<any>
                  )}
              <FormError
                formErrors={formState.errors}
                field={input.name}
                errorMessages={input.errorMessages}
                width={`calc(${input.width || "250px"} - 32px)`}
              />
            </Container>
          );
        })}
      </Stack>
    </form>
  );
};

export default memo(Form, (prevProps, nextProps) => {
  return prevProps.inputs === nextProps.inputs && prevProps.formId === nextProps.formId;
});
