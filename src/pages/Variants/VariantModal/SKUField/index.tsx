import { useEffect, useState, ReactEventHandler } from "react";
import CustomTextField from "../../../../components/CustomTextField";
import { styled as muiStyled } from "@mui/material/styles";
import styled from "styled-components";
import MuiAlert from "@mui/material/Alert";

const Container = styled.div`
  margin: 1em;
`;

const Alert = muiStyled(MuiAlert)`
  width: 243px;
`;

const SKUField = ({
  defaultValue,
  updatedValue,
  callback,
  onInput,
  showAlert,
  width
}: {
  defaultValue?: string;
  updatedValue?: string;
  callback?: (val: string) => void;
  onInput: ReactEventHandler<HTMLInputElement>;
  showAlert: boolean;
  width?: string;
}) => {
  const [value, setValue] = useState(updatedValue || defaultValue || "");
  const onChange: ReactEventHandler<HTMLInputElement> = event => {
    setValue(event.currentTarget.value);
    if (callback) {
      callback(event.currentTarget.value);
    }
  };
  useEffect(() => {
    if (updatedValue) {
      setValue(updatedValue);
      callback(updatedValue);
    }
  }, [updatedValue]);

  return (
    <Container>
      <CustomTextField
        internalLabel="SKU"
        name="sku"
        value={value}
        onChange={onChange}
        width={width}
        onInput={onInput}
      />
      {
        showAlert ? (
          <Alert severity="error">
            This SKU is in already in use by another variant
          </Alert>
        ) : null
      }
    </Container>
  );
};

export default SKUField;
