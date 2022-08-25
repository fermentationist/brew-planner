import { useState, useEffect, SyntheticEvent } from "react";
import MuiAccordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import CustomTextField from "../../../../components/CustomTextField";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { styled as muiStyled } from "@mui/material/styles";
import { ProductVariant } from "../../../../types";

interface Dimensions {
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
}
const TextField = muiStyled(CustomTextField)`
  margin: 1em 1em 1em 0;
`;
const Accordion = muiStyled(MuiAccordion)`
  max-width: fit-content;
  background-color: transparent;
`;

const VariantDimensions = ({
  callback,
  data
}: {
  callback: (dims: Dimensions) => void;
  data: ProductVariant;
}) => {
  const inputs = [
    {
      name: "length",
      label: "Length",
      defaultValue: data?.length,
      callback: (x: string) => x && parseFloat(x)
    },
    {
      name: "width",
      label: "Width",
      defaultValue: data?.width,
      callback: (x: string) => x && parseFloat(x)
    },
    {
      name: "height",
      label: "Height",
      defaultValue: data?.height,
      callback: (x: string) => x && parseFloat(x)
    },
    {
      name: "weight",
      label: "Weight",
      defaultValue: data?.weight,
      callback: (x: string) => x && parseFloat(x)
    }
  ];
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
  
  const [callbackValues, setCallbackValues] = useState(getInitialState());
  useEffect(() => {
    callback(callbackValues);
  }, [callbackValues]);

  const callbackWrapper = (cb: (val: any) => any, inputName: string) => {
    return (value: any) => {
      const newValue = value ? value : null;
      const updatedValues = {
        ...callbackValues,
        [inputName]: cb(newValue)
      };
      console.log("updatedValues in VariantDimensions:", updatedValues);
      setCallbackValues(updatedValues);
      return cb(value);
    };
  };

  return (
    <Accordion elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Dimensions</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {inputs.map((input, index) => {
          return (
            <TextField
              type="number"
              min="0"
              internalLabel={input.label || input.name}
              name={input.name}
              step="0.1"
              width="250px"
              key={index}
              defaultValue={input.defaultValue}
              onChange={
                input.callback
                  ? (event: SyntheticEvent) => {
                      const target = event.currentTarget as HTMLInputElement;
                      const value = target?.value;
                      return callbackWrapper(input.callback, input.name)(value);
                    }
                  : void 0
              }
            />
          );
        })}
      </AccordionDetails>
    </Accordion>
  );
};

export default VariantDimensions;
