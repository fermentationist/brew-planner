import {
  forwardRef,
  Ref,
  ReactEventHandler,
  FocusEventHandler,
  SyntheticEvent,
} from "react";
import TextField from "@mui/material/TextField";
import styled from "styled-components";
import { styled as muiStyled } from "@mui/material/styles";

// export type CustomTextFieldProps = TextFieldProps 

export interface CustomTextFieldProps {
  name: string;
  // register?: UseFormRegister<any>;
  label?: string;
  type?: string;
  margin?: string;
  width?: string;
  flexDirection?: string;
  internalLabel?: string;
  validation?: any;
  onFocus?: FocusEventHandler;
  onBlur?: ReactEventHandler;
  onChange?: ReactEventHandler;
  onInput?: ReactEventHandler;
  onKeyDown?: ReactEventHandler;
  onWheel?: ReactEventHandler;
  ref?: Ref<any>;
  defaultValue?: string | number;
  value?: string | number;
  className?: string;
  id?: string;
  errorMessages?: string | { [key: string]: any };
  step?: string;
  min?: string | number;
  max?: string | number;
  pattern?: RegExp | string;
  callback?: (value: string) => any;
  disabled?: boolean;
  multiline?: boolean;
  minRows?: number;
  maxRows?: number;
}

const CustomLabel = styled.label`
  margin: 1em;
`;

const CustomInput = muiStyled(TextField)<{
  marginoverride?: string;
  width?: string;
}>`
  margin: ${(props) => props.marginoverride || "1 em"};
  width: ${(props) => props.width || "250px"};
`;

const Container = styled.div<{ flexDirection?: string }>`
  display: flex;
  flex-direction: ${(props) => props.flexDirection || "column"};
`;

const CustomTextField = forwardRef(
  (props: CustomTextFieldProps, forwardedRef: Ref<any>) => {
    const Input = (
      <CustomInput
        width={props.width}
        marginoverride={props.margin}
        type={props.type || "text"}
        label={props.internalLabel}
        id={props.id || props.name}
        defaultValue={props.defaultValue}
        value={props.value}
        inputRef={forwardedRef}
        multiline={props.multiline}
        minRows={props.minRows}
        maxRows={props.maxRows}
        inputProps={{
          onBlur: props.onBlur,
          onFocus: props.onFocus,
          onChange: (event: SyntheticEvent) => {
            const target = event.target as HTMLInputElement;
            props.callback && props.callback(target.value);
            return props.onChange && props.onChange(event);
          },
          onInput: props.onInput,
          onKeyDown: props.onKeyDown,
          onWheel: props.onWheel,
          step: props.step || "any",
          min: props.min,
          max: props.max,
          pattern: props.pattern,
          disabled: props.disabled
        }}
        className={props.className || ""}
      />
    );

    return (
      <>
        {props.label ? (
          <Container flexDirection={props.flexDirection}>
            <CustomLabel htmlFor={props.name}>{props.label}</CustomLabel>
            {Input}
          </Container>
        ) : (
          <>{Input}</>
        )}
      </>
    );
  }
);

export default CustomTextField;
