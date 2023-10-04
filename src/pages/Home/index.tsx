import { useEffect } from "react";
import Page from "../../components/Page";
import withLoadingSpinner from "../../hoc/withLoadingSpinner";

const Home = ({
  startLoading,
  doneLoading
}: {
  startLoading: () => void;
  doneLoading: () => void;
}) => {
  useEffect(() => {
    // startLoading();
    setTimeout(() => {
      // doneLoading();
    }, 1000);
  }, [startLoading, doneLoading]);
  console.log("rendering Home...");
  return <Page>Home</Page>;
};

export default withLoadingSpinner(Home);
