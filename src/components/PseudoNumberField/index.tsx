import { forwardRef, Ref, KeyboardEvent } from "react";
import CustomTextField, { CustomTextFieldProps } from "../CustomTextField";

export type PseudoNumberFieldProps = Omit<
  CustomTextFieldProps,
  "type" | "defaultValue"
> & { 
  defaultValue?: number | string;
  allowNegative?: boolean;
  integerOnly?: boolean;
};

const PseudoNumberField = forwardRef(
  (props: PseudoNumberFieldProps, forwardedRef: Ref<any>) => {
    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Enter",
      "Escape",
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
    ];
    if (props.allowNegative) {
      allowedKeys.push("-");
    }
    if (!props.integerOnly) {
      allowedKeys.push(".");
    }
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLInputElement;
      const value = target.value;
      if (
        (value.includes(".") && event.key === ".") ||
        (event.key === ("-") && value !== "") ||
        !allowedKeys.includes(event.key)
      ) {
        event.preventDefault();
      }
    }

    return (
      <CustomTextField
        type="text"
        onKeyDown={onKeyDown}
        ref={forwardedRef}
        {...props}
      />
    );
  }
);

export default PseudoNumberField;
