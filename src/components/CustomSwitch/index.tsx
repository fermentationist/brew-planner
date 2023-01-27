import { forwardRef, Ref, useState } from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

type SwitchSize = "small" | "medium";
type SwitchLabelPlacement = "bottom" | "top" | "end" | "start";

export interface CustomSwitchProps {
  label?: string;
  name?: string;
  defaultChecked?: boolean;
  size?: SwitchSize;
  labelPlacement?: SwitchLabelPlacement;
  callback?: (val: any) => void;
  ref?: Ref<any>
}

const CustomSwitch = forwardRef(
  (
    {
      label,
      name,
      defaultChecked,
      size,
      labelPlacement,
      callback
    }: CustomSwitchProps,
    forwardedRef: Ref<any>
  ) => {
    const [checked, setChecked] = useState(!!defaultChecked);
    
    const toggleSwitch = () => {
      setChecked(!checked);
      if (callback) {
        callback(!checked);
      }
    };

    return (
      <FormControlLabel
        control={
          <Switch
            checked={checked}
            name={name}
            onClick={toggleSwitch}
            size={size}
            inputRef={forwardedRef}
          />
        }
        label={label}
        labelPlacement={labelPlacement || "start"}
      />
    );
  }
);

export default CustomSwitch;
