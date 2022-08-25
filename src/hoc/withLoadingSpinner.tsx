import React, {useState, FunctionComponent, useCallback} from "react";
import Page from "../components/Page";
import LoadingSpinner from "../components/styled/StyledSpinner";

interface IWrapperStyle {
  display: string;
  behavior?: string;
}
const withLoadingSpinner = (WrappedComponent: FunctionComponent<any>): FunctionComponent => {
  const MIN_DURATION = 750;
  return (props: any) => {
    const [loaded, setLoaded] = useState(false);
    const [wrapperStyle, setWrapperStyle] = useState<IWrapperStyle>({
      display: "none"
    });
    const doneLoading = () => {
      const timeout = setTimeout(() => {
        setLoaded(true);
        setWrapperStyle({
          display: "unset"
        });
      }, MIN_DURATION);
    }
    const startLoading = () => {
      setLoaded(false);
      setWrapperStyle({
        display: "none",
        behavior: "smooth"
      });
    }
    return (
      <>
        {
          !loaded ? (
            <Page>
              <LoadingSpinner />
            </Page>
          ) : null
        }
        <div style={wrapperStyle}>
          <WrappedComponent 
            doneLoading={useCallback(doneLoading, [])}
            startLoading={useCallback(startLoading, [])}
            {...props} 
          />
        </div>
      </>
    )
  }
}

export default withLoadingSpinner;
