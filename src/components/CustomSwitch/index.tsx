import { forwardRef, Ref, useState } from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

const CustomSwitch = forwardRef(
  (
    {
      label,
      name,
      type,
      defaultChecked,
      size,
      labelPlacement,
      callback
    }:{
      label?: string;
      name?: string;
      type?: string;
      defaultChecked?: boolean;
      size?: "small" | "medium";
      labelPlacement?: "bottom" | "top" | "end" | "start";
      callback?: (val: any) => void;
    },
    forwardedRef: Ref
  ) => {
    const [checked, setChecked] = useState(defaultChecked);
    
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
