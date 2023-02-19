import {
  useState,
  useEffect,
  SetStateAction,
  Dispatch,
  memo,
  useMemo,
} from "react";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/AddCircle";
import Tooltip from "@mui/material/Tooltip";
import useAPI from "../../hooks/useAPI";
import useAlert from "../../hooks/useAlert";
import useAuth from "../../hooks/useAuth";
import useConvertUnits from "../../hooks/useConvertUnits";
import DataTable, { columnOptions } from "../../components/DataTable";
import Page from "../../components/Page";
import withLoadingSpinner from "../../hoc/withLoadingSpinner";
import BrewhouseModal, { brewhouseInputs } from "./BrewhouseModal";
import { APIError, BrewhouseData, Mode } from "../../types";
import useConfirm from "../../hooks/useConfirm";

const Brewhouses = ({ startLoading, doneLoading }: { startLoading: () => void; doneLoading: () => void }) => {
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
    enable: enableBrewhouseQuery,
  } = useAPI("brewhouses");
  const { alertError, alertErrorProm, callAlert } = useAlert();
  const { confirmDelete } = useConfirm();
  const { auth } = useAuth();
  const {
    renameTempPreferredUnits,
    generateColumnsFromInputs,
    preferredUnits,
  } = useConvertUnits();
  useEffect(() => {
    if (isLoading && !brewhousesData) {
      enableBrewhouseQuery();
    }
    if (!isLoading) {
      if (brewhousesData) {
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
  }, [
    brewhousesData,
    isLoading,
    error,
    doneLoading,
    alertError,
    enableBrewhouseQuery,
  ]);

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
    // if response.data?.brewhouseUuid is undefined, renameTempPreferredUnits will just delete the preferredUnits that were temporarily created by the BrewhouseModal, otherwise it will rename them
    renameTempPreferredUnits(response.data?.brewhouseUuid);
    refresh();
    setShowBrewhouseModal(false);
  };

  const deleteBrewhouse = async (brewhouseUuid: string) => {
    const deleteBrewhouseRequest = new APIRequest({
      baseURL: BREWERY_ROUTE,
      url: `/brewhouses/${brewhouseUuid}`,
      method: "delete"
    });
    return deleteBrewhouseRequest.request().catch(async(error: APIError) => {
      await alertErrorProm(error);
    })
  }

  const deleteRows = async (rowsDeleted: any) => {
    const brewhouseUuidsToDelete = rowsDeleted.data.map(
      (row: { index: number; dataIndex: number }) => {
        return tableData[row.dataIndex].brewhouseUuid;
      }
    );
    const qty = brewhouseUuidsToDelete.length;
    const confirm = await confirmDelete(qty, "brewhouse");
    if (!confirm) {
      return;
    }
    if (qty > 1) {
      startLoading();
    }
    if (qty > 4) {
      callAlert("Please be patient, this may take a little while...");
    }
    for (const uuid of brewhouseUuidsToDelete) {
      console.log("attempting to delete brewhouse:", uuid);
      await deleteBrewhouse(uuid);
    }
    refresh();
    doneLoading();
  };

  const generatedColumns = generateColumnsFromInputs(brewhouseInputs);

  const columns = [
    {
      label: "Brewhouse ID",
      name: "brewhouseUuid",
      options: {
        ...columnOptions.options,
        display: false,
      },
    },
    ...generatedColumns,
    {
      name: "data",
      options: columnOptions.rowDataOptions,
    },
    {
      name: "",
      options: columnOptions.createRenderEditButtonOptions(
        "edit brewhouse",
        editBrewhouse
      ),
    },
  ];
  console.log("Brewhouses columns:", columns);
  return (
    <Page>
      <Tooltip title="Add Brewhouse">
        <IconButton onClick={addBrewhouse}>
          <AddIcon />
        </IconButton>
      </Tooltip>
      <DataTable
        data={tableData}
        columns={useMemo(() => columns, [preferredUnits])}
        refresh={refresh}
        options={{
          selectableRows: "multiple",
          selectableRowsHeader: true,
          onRowsDelete: deleteRows
        }}
      />
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
