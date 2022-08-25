import { useLocation } from "react-router-dom";

const withLocation = (Component: any) => { // for use with class components
  return (props: any) => {
    const location = useLocation();
    return (
      <Component location={location} {...props} />
    )

  }
}

export default withLocation;
