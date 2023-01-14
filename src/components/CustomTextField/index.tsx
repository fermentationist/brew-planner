import {
  forwardRef,
  Ref,
  ReactEventHandler,
  FocusEventHandler,
  ChangeEventHandler
} from "react";
import TextField from "@mui/material/TextField";
import styled from "styled-components";
import { UseFormRegister } from "react-hook-form";
import { styled as muiStyled } from "@mui/material/styles";

export interface CustomTextFieldProps {
  name: string;
  register?: UseFormRegister<any>;
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
  ref?: Ref<any>;
  defaultValue?: string | number;
  value?: string | number;
  className?: string;
  errorMessages?: string | {[key: string]: any};
  step?: string;
  min?: string;
}

const CustomLabel = styled.label`
  margin: 1em;
`;

const CustomInput = muiStyled(TextField)<{
  marginoverride?: string;
  width?: string;
}>`
  margin: ${props => props.marginoverride || "1 em"};
  width: ${props => props.width || "250px"};
`;

const Container = styled.div<{ flexDirection?: string }>`
  display: flex;
  flex-direction: ${props => props.flexDirection || "column"};
`;

const CustomTextField = forwardRef(
  (props: CustomTextFieldProps, forwardedRef: Ref<any>) => {
    const Input = (
      <CustomInput
        width={props.width}
        marginoverride={props.margin}
        type={props.type || "text"}
        pattern={/\d/}
        label={props.internalLabel}
        id={props.name}
        defaultValue={props.defaultValue}
        value={props.value}
        inputRef={forwardedRef}
        inputProps={{
          onBlur: props.onBlur,
          onFocus: props.onFocus,
          onChange: props.onChange,
          onInput: props.onInput,
          onKeyDown: props.onKeyDown,
          step: props.step || "1",
          min: props.min
        }}
        className={props.className || ""}
        {...(props.register && props.register(props.name, props.validation))}
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
