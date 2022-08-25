import { Stack } from "@mui/material";
import React, {BaseSyntheticEvent, createElement, PropsWithChildren} from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import FormError from "../FormError";
import { ChildProps } from "../../types";

export interface FormProps extends ChildProps {
  defaultValues?: {
    [key: string]: any;
  };
  onSubmit: (event: BaseSyntheticEvent) => void;
  formId: string;
}

const Container = styled.div`
  margin: 1em;
`;
const Form = function(props: FormProps) {
  const {handleSubmit, register, formState: {errors: formErrors}} = useForm({ defaultValues: props.defaultValues });
  return (
    <form onSubmit={handleSubmit(props.onSubmit)} id={props.formId}>
      <Stack>
        {React.Children.map(props.children, (child: any) => {
          return child.props.name
            ? (
              <Container key={child.props.name}>
                {React.createElement(child.type, {
                  ...{
                    ...child.props,
                    register
                  }
                })}
                <FormError
                  formErrors={formErrors}
                  field={child.props.name}
                  errorMessages={child.props.errorMessages}
                  width={`calc(${child.props.width} - 32px)`}
                />
              </Container>
              )
            : child;
        })}
      </Stack>
    </form>
  );
}

export default Form;
