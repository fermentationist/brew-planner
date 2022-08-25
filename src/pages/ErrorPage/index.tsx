import React from "react";
import Page from "../../components/Page";

export interface ErrorProps {
  errorCode?: number;
  startLoading?: () => void;
  doneLoading?: () => void;
  errorTitle?: string;
  errorMessage?: string;
}

const ErrorPage = function (props: ErrorProps) {
  console.log("loading ErrorPage");
  const errorMessages: any = {
    401: {
      title: "Unauthorized",
      message: "You are not authorized to access this page."
    },
    404: {
      title: "Not found",
      message: "The page you are looking for was not found."
    }
  };
  return (
    <Page>
      {
        props.errorTitle ? (
          <h1>{props.errorTitle}</h1>
        ) : (
          <h1>{errorMessages[props.errorCode]?.title}</h1>
        )
      }
      {
        props.errorMessage ? (
          <p>{props.errorMessage}</p>
        ) : (
          <p>{errorMessages[props.errorCode]?.message}</p>
        )
      }
    </Page>
  );
};

export default ErrorPage;
