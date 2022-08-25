import Alert from "@mui/material/Alert";
import {styled as muiStyled} from "@mui/material/styles";

export interface FormErrorProps {
  formErrors: {
    [key: string]: any
  };
  field: string;
  errorMessages?: string | {[key: string]: string | ((errors: {[key: string]: any}) => string)};
  level?: "error" | "warning" | "info" | "success";
  width?: string;
}

const StyledAlert = muiStyled(Alert)<{width: string}>`
  width: ${props => props.width};
`;

const FormError = ({errorMessages, field, width, level, formErrors}: FormErrorProps) => {
  if (!formErrors[field] || !errorMessages) {
    return null;
  }
  let message = "";
  const error = formErrors[field].type;
  if (typeof errorMessages === "string") {
    message = errorMessages;
  } else if (errorMessages[error]) {
    const userMessage = errorMessages[error];
    if (typeof userMessage === "string") {
      message = userMessage;
    }
    if (typeof userMessage === "function") {
      message = (userMessage)(formErrors);
    }
  }
  return (
    <StyledAlert
      width={width}
      severity={level || "error"}
    >
      {message}
    </StyledAlert>
  );
}

export default FormError;
