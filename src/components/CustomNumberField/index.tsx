import {forwardRef, Ref, WheelEvent} from "react";
import CustomTextField, { CustomTextFieldProps } from "../CustomTextField";
import styled from "styled-components";

export type CustomNumberFieldProps = Omit<CustomTextFieldProps, "type">

const StyledNumberField = styled(CustomTextField)`
  /* These styles hide the up/down buttons in number inputs */
  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
    overflow: hidden;
  }

  /* Firefox */
  input[type="number"] {
    -moz-appearance: textfield;
  }
`;

const CustomNumberField = forwardRef((props: CustomNumberFieldProps, forwardedRef: Ref<any>) => {
  const preventScrollingInNumberInput = (event: WheelEvent) => {
    const target = event.target as HTMLInputElement;
    target.blur();
    return false;
  };

  return (
    <StyledNumberField
      type= "number"
      onWheel={preventScrollingInNumberInput}
      ref={forwardedRef}
      {...props}
    />
  )

});

export default CustomNumberField;