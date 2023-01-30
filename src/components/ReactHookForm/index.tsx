import { Stack } from "@mui/material";
import React, {
  BaseSyntheticEvent,
  useRef,
  createElement,
  ChangeEvent,
  FunctionComponent,
  ComponentPropsWithoutRef,
  memo
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
import { ChildProps } from "../../types";
import { FormInputOptions } from "../FormModal";

const COMPONENT_TYPES: Record<string, FunctionComponent> = {
  text: CustomTextField,
  number: CustomNumberField,
  select: CustomAutocomplete,
  switch: CustomSwitch,
  numberWithUnits: CustomNumberFieldWithUnits,
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
    trigger,
  } = useForm({ defaultValues });

  const callbackWrapper = (
    cb: (val: any) => any,
    inputName: string,
    transformFn?: (val: any) => any
  ) => {
    return (value: any, callRHFSetValueFn = true) => {
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

  const onSubmitWrapper = (onSubmitFn: (val: any) => any) => {
    return (partialFormData: any) => {
      const formData = {
        ...partialFormData,
        ...callbackValuesRef.current,
      };

      return onSubmitFn(formData);
    };
  };

  type ComponentProps =
    | CustomAutocompleteProps
    | CustomSwitchProps
    | CustomNumberFieldWithUnitsProps
    | CustomTextFieldProps
    | CustomNumberFieldProps;

  const getProps = (input: FormInputOptions): ComponentProps => {
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
          label: input.label ?? input.name
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
          defaultValue: input.convertOnUnitChange ? void 0 : input.defaultValue,
          value: input.convertOnUnitChange ? input.defaultValue ?? input.value : void 0
        } as CustomNumberFieldWithUnitsProps;
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
            ref,
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
          
          return (
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

export default memo(Form, () => true);
