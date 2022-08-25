import MuiCard from "@mui/material/Card";
import MuiButton from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "../../../components/CustomTextField";
import FormError from "../../../components/FormError";
import styled from "styled-components";
import { styled as muiStyled } from "@mui/material/styles";
import { useForm } from "react-hook-form";
import { FormEvent, useState } from "react";

export interface LoginFormProps {
  onSubmit: ({email, password} : {email: string, password: string}, event: FormEvent) => Promise<boolean>;
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
    formState: { errors: formErrors }
  } = useForm();
  const togglePasswordReset = () => {
    setResetState(!resetState);
  }
  return (
    <Card>
      <Container className="login-form-inner-container">
        <form onSubmit={(event) => {handleSubmit(props.onSubmit)(event); return false;}} id={resetState ? "reset-form" : "login-form"}>
          <Grid container spacing={2} direction="column">
            <Grid item>
              <TextField
                name="email"
                register={register}
                internalLabel="Email"
                validation={{ required: true }}
                width="250px"
              />
              <FormError
                formErrors={formErrors}
                field="email"
                errorMessages={{required: "required field"}}
                width="220px"
              />
            </Grid>
            {
              !resetState ? (
                <>
                  <Grid item>
                    <TextField
                      name="password"
                      register={register}
                      type="password"
                      internalLabel="Password"
                      validation={{ required: true }}
                      width="250px"
                    />
                    <FormError
                      formErrors={formErrors}
                      field="password"
                      errorMessages={{required: "required field"}}
                      width="220px"
                    />
                  </Grid>
                  <Grid item>
                    <Button type="submit" form="login-form" variant="contained">
                      Log in
                    </Button>
                    <Button onClick={togglePasswordReset}>
                      reset password
                    </Button>
                  </Grid>
                </>
              ) : (
                <Grid item>
                    <Button type="submit" form="reset-form" variant="contained">
                      Send email
                    </Button>
                    <Button onClick={togglePasswordReset}>
                      Log in
                    </Button>
                  </Grid>
              )
            }
          </Grid>
        </form>
      </Container>
    </Card>
  );
};

export default LoginForm;
