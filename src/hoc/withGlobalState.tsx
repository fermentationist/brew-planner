import useGlobalState from "../hooks/useGlobalState";

const withGlobalState = (Component: any) => { // for use with class components
  return (props: any) => {
    const {auth: [globalState, dispatch]} = useGlobalState();
    return (
      <Component globalState={globalState} dispatch={dispatch} {...props} />
    )

  }
}

export default withGlobalState;
