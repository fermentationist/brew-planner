import { KeyboardEventHandler, useState, useEffect } from "react";
import CustomDialog from "../CustomDialog";
import CustomAutocomplete from "../CustomAutocomplete";
import { styled as muiStyled } from "@mui/material/styles";
import { AuthObject, BreweryData } from "../../types";
import useAPI from "../../hooks/useAPI";
import useAlert from "../../hooks/useAlert";
import { Typography } from "@mui/material";

const StyledAutocomplete = muiStyled(CustomAutocomplete)`
  width: 450px;
  @media screen and (max-width: 600px) {
    width: 250px;
  }
`;

const BrewerySelector = ({
  onSubmit,
  loading,
  auth
}: {
  onSubmit: (breweryName: string) => void;
  loading?: boolean;
  auth: AuthObject;
}) => {
  const [breweriesData, setBreweriesData] = useState([]);
  const [selectedBrewery, setSelectedBrewery] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [confirmedBrewery, setConfirmedBrewery] = useState(null);
  const {isLoading, error, data} = useAPI("breweries");
  const { alertError } = useAlert();

  useEffect(() => {
    if (!isLoading) {
      if (data) {
        const allBreweries = data.data?.breweries;
        const allowedBreweries = allBreweries.filter((brewery: BreweryData) => {
          return auth?.user?.role === "admin" || auth?.user?.breweries.includes(brewery.breweryId)
        });
        setBreweriesData(allowedBreweries);
        const [currentBrewery] = allowedBreweries.filter(
          (brewery: BreweryData) => brewery.breweryId === auth?.currentBrewery
        );
        console.log("currentBrewery?.name:", currentBrewery?.name);
        setSelectedBrewery(currentBrewery?.name);
        setConfirmedBrewery(currentBrewery?.name);
      }
      if (error) {
        alertError(error);
      }
    }
  }, [isLoading, data, error, alertError]);

  const autocompleteCallback = (breweryName: string) => {
    setSelectedBrewery(breweryName);
  };
  const onKeyDown: KeyboardEventHandler = event => {
    if (event.key === "Enter") {
      onSubmitWrapper(onSubmit)();
    }
  };
  const onSubmitWrapper = (fn: (breweryName: string) => void) => {
    return () => {
      setConfirmedBrewery(selectedBrewery);
      const [brewery] = breweriesData.filter(brewery => brewery.name === selectedBrewery);
      setShowDialog(false);
      return fn(brewery?.breweryId);
    }
  };

  return (
    <>
      <Typography onClick={() => setShowDialog(true)}>
        {`Current brewery: ${confirmedBrewery || "None selected"}`}
      </Typography>
      { 
        showDialog ? (
          <CustomDialog
            showDialog={showDialog}
            closeDialog={() => setShowDialog(false)}
            title="Select Brewery"
            confirm={onSubmitWrapper(onSubmit)}
            loading={loading}
          >
            <StyledAutocomplete
              options={breweriesData.map((brewery: BreweryData) => brewery.name)}
              callback={autocompleteCallback}
              label="Selected Brewery"
              restricted={true}
              defaultValue={selectedBrewery}
              onKeyDown={onKeyDown}
            />
          </CustomDialog>
        ) : null
      }
    </>
  );
};

export default BrewerySelector;
