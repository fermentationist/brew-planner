import { useState, FormEvent, useEffect, FormEventHandler } from "react";
import TextField from "@mui/material/TextField";
import ButtonGroup from "@mui/material/ButtonGroup";
import MuiButton from "@mui/material/Button";
import { styled as muiStyled } from "@mui/material/styles";
interface InputProps {
  width?: string;
}
const Input = muiStyled(TextField)<InputProps>`
  width: ${props => props.width || "112px"};
`;

const Button = muiStyled(MuiButton)`
  width: 56px;
`;
const IntegerInput = ({
  callback,
  defaultValue,
  width,
  diffProp,
  className
}: {
  callback: (val: number) => void;
  defaultValue: number;
  width?: string;
  diffProp?: number;
  className?: string;
}) => {
  const [value, setValue] = useState(defaultValue || 0);
  const [integerColor, setIntegerColor] = useState("unset");

  useEffect(() => {
    if (diffProp) {
      setValue(defaultValue + diffProp);
      wrappedCallback(defaultValue + diffProp);
    }
  }, [diffProp, defaultValue]);
  const wrappedCallback = (n: number) => {
    if (n > defaultValue) {
      setIntegerColor("green");
    } else if (n < defaultValue) {
      setIntegerColor("red");
    } else {
      setIntegerColor("unset");
    }
    return callback(n);
  };
  const increment = () => {
    const newValue = Math.max(value + 1, 0);
    setValue(newValue);
    return wrappedCallback(newValue);
  };
  const decrement = () => {
    const newValue = Math.max(value - 1, 0);
    setValue(newValue);
    return wrappedCallback(newValue);
  };
  const onChange: FormEventHandler = (event: FormEvent<HTMLInputElement>) => {
    const userInput = event.currentTarget.value;
    const regex = /^\d*$/;
    if (!regex.test(userInput)) {
      event.currentTarget.value = "";
      return alert("This field only accepts positive integers");
    }
    const userValue = userInput ? parseInt(userInput) : 0;
    const newValue = Math.max(userValue, 0);
    setValue(newValue);
    return wrappedCallback(newValue);
  };
  return (
    <>
      <ButtonGroup className={className}>
        <Button color="error" variant="contained" onClick={decrement}>
          -
        </Button>
        <Input
          type="number"
          value={value}
          onChange={onChange}
          inputProps={{ style: { textAlign: "center", color: integerColor } }}
          width={width}
        />
        <Button color="success" variant="contained" onClick={increment}>
          +
        </Button>
      </ButtonGroup>
    </>
  );
};

export default IntegerInput;
