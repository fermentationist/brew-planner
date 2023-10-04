import React, { useState, ComponentType, useCallback } from "react";
import Page from "../components/Page";
import LoadingSpinner from "../components/styled/StyledSpinner";

interface IWrapperStyle {
  display: string;
  behavior?: string;
}

type ComponentProps<P> = Omit<P, "startLoading" | "doneLoading">;

function withLoadingSpinner<P>(
  WrappedComponent: ComponentType<ComponentProps<P>>
): ComponentType<P> {
  const MIN_DURATION = 750;
  let timeout: number;
  return (props: any) => {
    const [loaded, setLoaded] = useState(false);
    const [wrapperStyle, setWrapperStyle] = useState<IWrapperStyle>({
      display: "none",
    });
    const doneLoading = () => {
      timeout = setTimeout(() => {
        setLoaded(true);
        setWrapperStyle({
          display: "unset",
        });
      }, MIN_DURATION);
    };
    const startLoading = () => {
      clearTimeout(timeout);
      setLoaded(false);
      setWrapperStyle({
        display: "none",
        behavior: "smooth",
      });
    };
    return (
      <>
        {!loaded ? (
          <Page containerMargin="0">
            <LoadingSpinner />
          </Page>
        ) : null}
        <div style={wrapperStyle}>
          <WrappedComponent
            doneLoading={useCallback(doneLoading, [])}
            startLoading={useCallback(startLoading, [])}
            {...props}
          />
        </div>
      </>
    );
  };
}

export default withLoadingSpinner;
