import { useState, useEffect, SetStateAction, Dispatch } from "react";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/AddCircle";
import Tooltip from "@mui/material/Tooltip";
import useAPI from "../../hooks/useAPI";
import useAlert from "../../hooks/useAlert";
import useAuth from "../../hooks/useAuth";
import DataTable, { columnOptions } from "../../components/DataTable";
import Page from "../../components/Page";
import withLoadingSpinner from "../../hoc/withLoadingSpinner";
import BrewhouseModal, {BrewhouseForm} from "./BrewhouseModal";
import { APIError } from "../../types";

export interface BrewhouseData extends Required<BrewhouseForm> {
  brewhouseUuid: string;
}

type Mode = "create" | "edit";

const Brewhouses = ({
  doneLoading,
  startLoading,
}: {
  doneLoading: () => void;
  startLoading: () => void;
}) => {
  const [tableData, setTableData] = useState([]);
  const [showBrewhouseModal, setShowBrewhouseModal] = useState(false);
  const [mode, setMode]: [mode: Mode, setMode: Dispatch<SetStateAction<Mode>>] = useState("create" as Mode);
  const [modalData, setModalData] = useState(null);
  const { data: brewhousesData, loading, error, refetch: refresh, BREWERY_ROUTE, APIRequest } = useAPI("brewhouses");
  const { alertError, alertErrorProm } = useAlert();
  const {auth} = useAuth();

  useEffect(() => {
    if (!loading) {
      if (brewhousesData) {
        console.log("brewhousesData:", brewhousesData.data?.brewhouses);
        setTableData(brewhousesData.data?.brewhouses);
      }
      if (error) {
        console.error(error);
        alertError(error);
      }
      doneLoading();
    }
  }, [brewhousesData, loading, error, doneLoading, alertError]);

  const addBrewhouse = () => {
    setShowBrewhouseModal(true);
    setMode("create" as Mode);
    setModalData(null);
  }

  const editBrewhouse = (rowData: BrewhouseData) => {
    setShowBrewhouseModal(true);
    setMode("edit" as Mode);
    setModalData(rowData);
  }

  const createOrUpdateBrewhouse = async (formData: BrewhouseForm) => {
    console.log("formData:", formData);
    const editMode = mode === "edit";
    const reqBody = editMode ? formData : {...formData, createdBy: auth?.user?.uid}
    const url = editMode ? "/brewhouses/" + modalData.brewhouseUuid : "/brewhouses";
    const apiReq = new APIRequest({
      baseURL: BREWERY_ROUTE,
      url,
      method: editMode ? "patch" : "post",
      data: reqBody
    });
    const response = await apiReq.request().catch(async (error: APIError) => {
      await alertErrorProm(error);
    });
    console.log("response:", response);
    refresh();
    setShowBrewhouseModal(false);
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
    {
      name: "editRow",
      options: {
        ...columnOptions.actionOptions
      }
    }
  ];
  console.log("columns:", columns)
  return (
    <Page>
      <Tooltip title="Add Brewhouse">
        <IconButton onClick={addBrewhouse}>
          <AddIcon />
        </IconButton>
      </Tooltip>
      <DataTable data={tableData} columns={columns} refresh={refresh}/>
      {
        showBrewhouseModal ? (
          <BrewhouseModal
            showModal={showBrewhouseModal}
            closeModal={() => setShowBrewhouseModal(false)}
            mode={mode}
            data={modalData}
            onSubmit={createOrUpdateBrewhouse}
          />
        ) : null
      }
    </Page>
  );
};

export default withLoadingSpinner(Brewhouses);
