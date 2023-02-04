import { useState, useEffect, SetStateAction, Dispatch, memo, useMemo } from "react";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/AddCircle";
import Tooltip from "@mui/material/Tooltip";
import useAPI from "../../hooks/useAPI";
import useAlert from "../../hooks/useAlert";
import useAuth from "../../hooks/useAuth";
import useConvertUnits from "../../hooks/useConvertUnits";
import useCreateColumnsWithUnitConversion from "../../hooks/useCreateColumnsWithUnitConversion";
import DataTable, { columnOptions } from "../../components/DataTable";
import Page from "../../components/Page";
import withLoadingSpinner from "../../hoc/withLoadingSpinner";
import BrewhouseModal, { brewhouseInputs } from "./BrewhouseModal";
import { APIError, BrewhouseData } from "../../types";

type Mode = "create" | "edit";

const Brewhouses = ({
  doneLoading
}: {
  doneLoading: () => void;
}) => {
  const [tableData, setTableData] = useState([]);
  const [showBrewhouseModal, setShowBrewhouseModal] = useState(false);
  const [mode, setMode]: [mode: Mode, setMode: Dispatch<SetStateAction<Mode>>] =
    useState("create" as Mode);
  const [modalData, setModalData] = useState(null);
  const {
    data: brewhousesData,
    isLoading,
    error,
    refetch: refresh,
    BREWERY_ROUTE,
    APIRequest,
    enable: enableBrewhouseQuery
  } = useAPI("brewhouses");
  const { alertError, alertErrorProm } = useAlert();
  const { auth } = useAuth();
  const {generateColumnsFromInputs} = useCreateColumnsWithUnitConversion();
  const {renameNewPreferredUnits} = useConvertUnits();
  useEffect(() => {
    if (isLoading && !brewhousesData) {
      enableBrewhouseQuery();
    }
    if (!isLoading) {
      if (brewhousesData) {
        console.log("brewhousesData:", brewhousesData.data?.brewhouses);
        const dataWithNestedRowData = brewhousesData.data?.brewhouses?.map(
          (row: BrewhouseData) => {
            const rowCopy = { ...row };
            rowCopy.data = { ...row };
            return rowCopy;
          }
        );
        setTableData(dataWithNestedRowData);
      }
      if (error) {
        console.error(error);
        alertError(error);
      }
      doneLoading();
    }
  }, [brewhousesData, isLoading, error, doneLoading, alertError, enableBrewhouseQuery]);

  const addBrewhouse = () => {
    setShowBrewhouseModal(true);
    setMode("create" as Mode);
    setModalData(null);
  };

  const editBrewhouse = (rowData: BrewhouseData) => {
    setModalData(rowData?.data ?? rowData);
    setMode("edit" as Mode);
    setShowBrewhouseModal(true);
  };

  const createOrUpdateBrewhouse = async (formData: BrewhouseData) => {
    console.log("formData:", formData);
    const editMode = mode === "edit";
    const reqBody = editMode
      ? formData
      : { ...formData, createdBy: auth?.user?.uid };
    const url = editMode
      ? "/brewhouses/" + modalData.brewhouseUuid
      : "/brewhouses";
    const apiReq = new APIRequest({
      baseURL: BREWERY_ROUTE,
      url,
      method: editMode ? "patch" : "post",
      data: reqBody,
    });
    const response = await apiReq.request().catch(async (error: APIError) => {
      await alertErrorProm(error);
    });
    console.log("response:", response);
    !editMode && renameNewPreferredUnits(response.data?.brewhouseUuid);
    refresh();
    setShowBrewhouseModal(false);
  };

  const generatedColumns = generateColumnsFromInputs(brewhouseInputs);

  const columns = [
    {
      title: "Brewhouse ID",
      name: "brewhouseUuid",
      options: {
        ...columnOptions.options,
        display: false
      }
    },
    ...generatedColumns,
    {
      name: "data",
      options: columnOptions.rowDataOptions
    },
    {
      name: "",
      options: columnOptions.createRenderEditButtonOptions(
        "edit brewhouse",
        editBrewhouse
      ),
    },
  ]
  return (
    <Page>
      <Tooltip title="Add Brewhouse">
        <IconButton onClick={addBrewhouse}>
          <AddIcon />
        </IconButton>
      </Tooltip>
      <DataTable data={tableData} columns={columns} refresh={refresh} />
      {showBrewhouseModal ? (
        <BrewhouseModal
          showModal={showBrewhouseModal}
          closeModal={() => setShowBrewhouseModal(false)}
          mode={mode}
          data={modalData}
          onSubmit={createOrUpdateBrewhouse}
        />
      ) : null}
    </Page>
  );
};

export default withLoadingSpinner(memo(Brewhouses, () => true));
