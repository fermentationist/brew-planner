import useAuth from "../../hooks/useAuth";
import LoginForm from "./LoginForm";
import Page from "../../components/Page";
import { RouterLocation } from "../../types";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import useAlert from "../../hooks/useAlert";
import { FormEvent } from "react";
import useAPI from "../../hooks/useAPI";

const Login = () => {
  const { auth: [authStore], login, sendPasswordResetEmail } = useAuth();
  const { refetchAll } = useAPI();
  const navigate = useNavigate();
  const {callAlert} = useAlert();
  const location: RouterLocation = useLocation();
  const from = location.state?.from?.pathname || "/";
  const submitLogin = async ({email, password} : {email: string; password: string;}, event: FormEvent) => {
    event.preventDefault();
    const target = event.target as Element;
    if (target?.id === "reset-form") {
      console.log("reset password!!!");
      sendPasswordResetEmail(email);
      callAlert("Password reset email sent");
      return;
    }
    console.log("login() called.")
    const success = await login(email, password);
    if (success) {
      await refetchAll();
      navigate(from, { replace: true });
    } else {
      callAlert("Could not login. Verify email and password and try again.");
    }
    return false;
  };
  if (authStore?.user) {
    return <Navigate to={from || "/home"} />;
  }
  return (
    <Page>
      <LoginForm onSubmit={submitLogin} />
    </Page>
  );
};

export default Login;
