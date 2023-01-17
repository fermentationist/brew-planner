import { useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/AddCircle";
import Tooltip from "@mui/material/Tooltip";
import useAPI from "../../hooks/useAPI";
import useAlert from "../../hooks/useAlert";
import DataTable, { columnOptions } from "../../components/DataTable";
import Page from "../../components/Page";
import withLoadingSpinner from "../../hoc/withLoadingSpinner";
import BrewhouseModal from "./BrewhouseModal";
import useGlobalState from "../../hooks/useGlobalState.ts";

const Brewhouses = ({
  doneLoading,
  startLoading,
}: {
  doneLoading: () => void;
  startLoading: () => void;
}) => {
  const [tableData, setTableData] = useState([]);
  const [showBrewhouseModal, setShowBrewhouseModal] = useState(false);
  const [mode, setMode] = useState("create");
  const { data: brewhouseData, loading, error, refresh } = useAPI("brewhouse");
  const { alertError } = useAlert();
  const [globalState] = useGlobalState();
  useEffect(() => {
    if (!loading) {
      if (brewhouseData) {
        console.log("brewhouseData:", brewhouseData.data.brewhouses);
        setTableData(brewhouseData.data.brewhouses);
      }
      if (error) {
        console.error(error);
        alertError(error);
      }
      doneLoading();
    }
  }, [brewhouseData, loading, error, doneLoading, alertError]);

  const addBrewhouse = () => {
    setShowBrewhouseModal(true);
  }

  const options = {
    sortThirdClickReset: true,
  };
  const columns = [
    {
      label: "Name",
      name: "name",
      options,
    },
    {
      label: "Date created",
      name: "created_at",
      options: columnOptions.dateOptions,
    },
  ];
  return (
    <Page>
      <Tooltip title="Add Brewhouse">
        <IconButton onClick={addBrewhouse}>
          <AddIcon />
        </IconButton>
      </Tooltip>
      <DataTable data={tableData} columns={columns} />
      <BrewhouseModal
        showModal={showBrewhouseModal}
        closeModal={() => setShowBrewhouseModal(false)}
        mode={mode}
      />
    </Page>
  );
};

export default withLoadingSpinner(Brewhouses);
