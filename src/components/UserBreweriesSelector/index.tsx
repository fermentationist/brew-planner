import { useState, useEffect } from "react";
import DualTableMultiSelector from "../DualTableMultiSelector";
import styled from "styled-components";
import useAPI from "../../hooks/useAPI";
import useAlert from "../../hooks/useAlert";

const StyledDualTableMultiSelector = styled(DualTableMultiSelector)`
  margin: 1em;
`;

const UserBreweriesSelector = ({
  defaultSelected,
  callback,
  className
}: {
  defaultSelected: any[];
  callback: (val: any[]) => void;
  className?: string;
}) => {
  const [allBreweries, setAllBreweries] = useState([]);
  const { isLoading: loading, data, error } = useAPI("breweries");
  const { callAlert } = useAlert();

  useEffect(() => {
    if (!loading) {
      if (data) {
        setAllBreweries(data.data?.breweries);
      }
      if (error) {
        callAlert({ message: error.message, title: error.name });
      }
    }
  }, [data, error, loading, callAlert]);

  const breweryColumns = [
    {
      label: "",
      name: "breweryId",
      options: {
        display: false
      }
    },
    {
      // label: "Brewery name",
      label: " ",
      name: "name"
    }
  ];
  return (
    <StyledDualTableMultiSelector // TODO: Fix TS error caused by use of withDeepMemo in export of DualTableMultiSelector
      selectedOptions={defaultSelected}
      allOptions={allBreweries}
      optionKey="breweryId"
      callback={callback}
      columns={breweryColumns}
      title="Authorized Brewery"
      pluralTitle="Authorized Breweries"
      className={className}
    />
  );
};

export default UserBreweriesSelector;
