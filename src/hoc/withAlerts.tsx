import useAlert from "../hooks/useAlert";

const withAlerts = (Component: any) => { // for use with class components
  return (props: any) => {
    const {callAlert} = useAlert();
    return (
      <Component callAlert={callAlert} {...props} />
    )

  }
}

export default withAlerts;
