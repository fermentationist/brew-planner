import useGlobalState from "../hooks/useGlobalState";

const withGlobalState = (Component: any) => { // for use with class components
  return (props: any) => {
    const [globalState, setGlobalState] = useGlobalState();
    return (
      <Component globalState={globalState} setGlobalState={setGlobalState} {...props} />
    )

  }
}

export default withGlobalState;
