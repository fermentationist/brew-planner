import MuiCard from "@mui/material/Card";
import MuiButton from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "../../../components/CustomTextField";
import FormError from "../../../components/FormError";
import styled from "styled-components";
import { styled as muiStyled } from "@mui/material/styles";
import { useForm } from "react-hook-form";
import { FormEvent, useState } from "react";
import ReactHookForm from "../../../components/ReactHookForm";

export interface LoginFormProps {
  onSubmit: (
    { email, password }: { email: string; password: string },
    event: FormEvent
  ) => Promise<boolean>;
}

const Button = muiStyled(MuiButton)`
  margin: 1em 1em 1em 0;
`;
const Card = muiStyled(MuiCard)`
  width: 350px;
  @media screen and (max-width: 600px) {
    width: calc(100vw - 30px);
  }
`;

const Container = styled.div`
  margin: 1em;
`;

const LoginForm = (props: LoginFormProps): JSX.Element => {
  const [resetState, setResetState] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm();
  const togglePasswordReset = () => {
    setResetState(!resetState);
  };
  const inputs = [
    {
      name: "email",
      label: "Email",
      type: "email",
      validation: {
        required: true,
      },
      errorMessages: {
        required: "required field",
      },
      width: "250px",
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      validation: {
        required: true,
      },
      errorMessages: {
        required: "required field",
      },
      width: "250px",
    },
  ];
  const formInputs = !resetState ? inputs : inputs.slice(0, 1);
  return (
    <Card>
      <Container className="login-form-inner-container">
        <ReactHookForm
          inputs={formInputs}
          formId={resetState ? "reset-form" : "login-form"}
          onSubmit={props.onSubmit}
        />
        {
          !resetState ? (
            <>
              <Button type="submit" form="login-form" variant="contained">
                Log in
              </Button>
              <Button onClick={togglePasswordReset}>
                reset password
              </Button>
            </>
          ) : (
            <>
              <Button type="submit" form="reset-form" variant="contained">
                Send email
              </Button>
              <Button onClick={togglePasswordReset}>
                Log in
              </Button>
            </>
          )
        }
      </Container>
    </Card>
  );
};

export default LoginForm;
