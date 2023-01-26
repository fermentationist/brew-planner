import { Stack } from "@mui/material";
import React, {
  BaseSyntheticEvent,
  useRef,
  createElement,
  ChangeEvent
} from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import CustomTextField, { CustomTextFieldProps } from "../CustomTextField";import CustomNumberField, {CustomNumberFieldProps} from "../CustomNumberField";
import CustomTextFieldWithUnits, {
  CustomTextFieldWithUnitsProps,
} from "../CustomTextFieldWithUnits";
import CustomAutocomplete, {
  CustomAutocompleteProps,
} from "../CustomAutocomplete";
import CustomSwitch, { CustomSwitchProps } from "../CustomSwitch";
import FormError from "../FormError";
import { ChildProps } from "../../types";
import { FormInputOptions } from "../FormModal";

const COMPONENT_TYPES = {
  text: CustomTextField,
  number: CustomNumberField,
  select: CustomAutocomplete,
  switch: CustomSwitch,
  withUnits: CustomTextFieldWithUnits,
};

export interface FormProps extends ChildProps {
  onSubmit: (event: BaseSyntheticEvent) => void;
  formId: string;
  inputs: FormInputOptions[];
}

const Container = styled.div`
  margin: 1em;
`;

const Form = function (props: FormProps) {
  const getDefaultValues = (inputs: FormInputOptions[]) => {
    return inputs.reduce((map, input) => {
      if (input.defaultChecked ?? input.defaultValue) {
        map[input.name] = input.defaultChecked ?? input.defaultValue;
      }
      return map;
    }, {});
  };
  const {
    handleSubmit,
    register,
    formState,
    setValue: setInputValue,
    trigger,
  } = useForm({
    defaultValues: getDefaultValues(props.inputs),
  });

  const callbackValuesRef = useRef(getDefaultValues(props.inputs));

  const callbackWrapper = (cb: (val: any) => any, inputName: string) => {
    return (value: any) => {
      console.log("value in callbackWrapper:", value);
      setInputValue(inputName, value);
      const newValues = {
        ...callbackValuesRef.current,
        [inputName]: value,
      };
      callbackValuesRef.current = newValues;
      return cb(value);
    };
  };

  const onSubmitWrapper = (onSubmitFn: (val: any) => any) => {
    return (partialFormData: any) => {
      console.log("partialFormData:", partialFormData);
      console.log("callbackValuesRef.current:", callbackValuesRef.current);
      const formData = {
        ...partialFormData,
        ...callbackValuesRef.current,
      };

      return onSubmitFn(formData);
    };
  };

type ComponentProps = CustomAutocompleteProps | CustomSwitchProps | CustomTextFieldWithUnitsProps | CustomTextFieldProps

  const getProps = (
    input: FormInputOptions
  ): ComponentProps => {
    let componentProps: ComponentProps = {
      name: input.name,
      type: input.type === "withUnits" ? "number" : (input.type || "text"),
      internalLabel: input.label || input.name,
      step: input.step,
      width: input.width,
      defaultValue: input.defaultValue,
      callback: callbackWrapper(input.callback || ((x: any) => x), input.name),
    };

    switch (input.type) {
      case "select":
        componentProps.options = input.selectOptions;
        componentProps.restricted = input.selectRestricted;
        break;

      case "switch":
        componentProps = {
          name: input.name,
          label: input.label,
          defaultChecked: input.defaultChecked ?? input.defaultValue,
          callback:
            callbackWrapper(input.callback || ((x: any) => x), input.name),
          labelPlacement: "end",
        };
        break;

      case "withUnits":
        componentProps.type = "number";
        break;
    }
    return componentProps;
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmitWrapper(props.onSubmit))}
      id={props.formId}
    >
      <Stack>
        {props.inputs.map((input: FormInputOptions) => {
          const inputProps = getProps(input);
          const { ref, onChange, onBlur } = register(
            input.name,
            input.validation
          );
          const allProps = {
            ...inputProps,
            onBlur,
            onChange: (event: ChangeEvent) => {
              const target = event.target as HTMLInputElement;
              const value =
                input.type === "switch" ? target.checked : target.value;
              setInputValue(input.name, value);
              input.onChange && input.onChange(event);
              if (Object.keys(formState.errors).length) {
                trigger(); // re-validate form
              }
              return onChange(event);
            },
          };
          if (input.type !== "withUnits") {
            allProps.ref = ref;
          }
          return (
            <Container key={input.name}>
              {input.child
                ? input.child
                : createElement(
                    COMPONENT_TYPES[input.type] || CustomTextField,
                    allProps
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

export default Form;
