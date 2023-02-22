import { useState, useEffect, useMemo, Dispatch, SetStateAction } from "react";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/AddCircle";
import useAPI from "../../hooks/useAPI";
import DataTable, { columnOptions } from "../../components/DataTable";
import Page from "../../components/Page";
import withLoadingSpinner from "../../hoc/withLoadingSpinner";
import useAlert from "../../hooks/useAlert";
import useConfirm from "../../hooks/useConfirm";
import useAuth from "../../hooks/useAuth";
import useConvertUnits from "../../hooks/useConvertUnits";
import HopModal, { hopInputs } from "./HopModal";
import { HopData, Mode, APIError } from "../../types";

const Hops = ({
  startLoading,
  doneLoading,
}: {
  startLoading: () => void;
  doneLoading: () => void;
}) => {
  const [tableData, setTableData] = useState([]);
  const [showHopModal, setShowHopModal] = useState(false);
  const [mode, setMode]: [mode: Mode, setMode: Dispatch<SetStateAction<Mode>>] =
    useState("create" as Mode);
  const [modalData, setModalData] = useState(null);
  const { callAlert, alertError, alertErrorProm, resetAlertState } = useAlert();
  const { auth } = useAuth();
  const { confirmDelete, confirm } = useConfirm();
  const {
    isLoading,
    enable: enableHopsQuery,
    data: hopsData,
    error: hopsError,
    refetch: refresh,
    APIRequest,
    BREWERY_ROUTE,
  } = useAPI("hops");
  const { generateColumnsFromInputs } = useConvertUnits();
  useEffect(() => {
    if (isLoading && !hopsData) {
      enableHopsQuery();
    }
    if (!isLoading) {
      if (hopsData) {
        const dataWithNestedRowData = hopsData.data?.hops?.map(
          (row: HopData) => {
            const rowCopy = { ...row };
            rowCopy.data = { ...row };
            return rowCopy;
          }
        );
        setTableData(dataWithNestedRowData);
      }
      if (hopsError) {
        console.error(hopsError);
        alertError(hopsError);
      }
      doneLoading();
    }
  }, [
    hopsData,
    isLoading,
    hopsError,
    doneLoading,
    alertError,
    enableHopsQuery,
  ]);

  const createOrUpdateHop = async (formData: HopData) => {
    const editMode = mode === "edit";
    const reqBody = editMode
      ? formData
      : { ...formData, createdBy: auth?.user?.uid };
    const url = editMode
      ? "/hops/" + modalData.hopUuid
      : "/hops";
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
    refresh();
    setShowHopModal(false);
  };

  const addHop = () => {
    setModalData(null);
    setMode("create");
    setShowHopModal(true);
  };

  const editHop = (rowData: HopData) => {
    setModalData(rowData);
    setMode("edit");
    setShowHopModal(true);
  };

  const deleteHop = async (hopUuid: string) => {
    const deleteHopRequest = new APIRequest({
      baseURL: BREWERY_ROUTE,
      url: `/hops/${hopUuid}`,
      method: "delete",
    });
    return deleteHopRequest.request().catch(async (error: APIError) => {
      await alertErrorProm(error);
    });
  };

  const deleteRows = async (rowsDeleted: any) => {
    const hopUuidsToDelete = rowsDeleted.data.map(
      (row: { index: number; dataIndex: number }) => {
        return tableData[row.dataIndex].hopUuid;
      }
    );
    const qty = hopUuidsToDelete.length;
    const confirmResult = await confirmDelete(qty, "hop");
    if (!confirmResult) {
      return;
    }
    if (qty > 4) {
      const secondConfirm = await confirm("Please be patient, this may take a little while...");
      if (!secondConfirm) {
        return;
      }
    }
    startLoading();
    let count = 1;
    for (const uuid of hopUuidsToDelete) {
      console.log("attempting to delete hop:", uuid);
      callAlert({message: `Deleting ${count} of ${hopUuidsToDelete.length} hops...`, showCloseButton: false});
      await deleteHop(uuid);
      count ++;
    }
    resetAlertState();
    refresh();
    doneLoading();
  };

  const generatedColumns = generateColumnsFromInputs(hopInputs);
  const columns = [
    {
      label: "Hop ID",
      name: "hopUuid",
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
        "edit hop",
        editHop
      ),
    },
  ];
  return (
    <Page>
      <Tooltip title="add hop">
        <IconButton onClick={addHop}>
          <AddIcon />
        </IconButton>
      </Tooltip>
      <DataTable
        columns={useMemo(() => columns, [])}
        data={tableData}
        refresh={refresh}
        options={{
          selectableRows: "multiple",
          selectableRowsHeader: true,
          onRowsDelete: deleteRows,
        }}
      />
      {showHopModal ? (
        <HopModal
          showModal={showHopModal}
          closeModal={() => setShowHopModal(false)}
          mode={mode}
          data={modalData}
          onSubmit={createOrUpdateHop}
        />
      ) : null}
    </Page>
  );
};

export default withLoadingSpinner(Hops);
