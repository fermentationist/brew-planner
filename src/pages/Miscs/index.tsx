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
import MiscModal, { miscInputs } from "./MiscModal";
import { MiscData, Mode, APIError } from "../../types";

const Miscs = ({
  startLoading,
  doneLoading,
}: {
  startLoading: () => void;
  doneLoading: () => void;
}) => {
  const [tableData, setTableData] = useState([]);
  const [showMiscModal, setShowMiscModal] = useState(false);
  const [mode, setMode]: [mode: Mode, setMode: Dispatch<SetStateAction<Mode>>] =
    useState("create" as Mode);
  const [modalData, setModalData] = useState(null);
  const { callAlert, alertError, alertErrorProm, resetAlertState } = useAlert();
  const { auth } = useAuth();
  const { confirmDelete, confirm } = useConfirm();
  const {
    isLoading,
    enable: enableMiscsQuery,
    data: miscsData,
    error: miscsError,
    refetch: refresh,
    APIRequest,
    BREWERY_ROUTE,
  } = useAPI("miscs");
  const { generateColumnsFromInputs } = useConvertUnits();
  useEffect(() => {
    if (isLoading && !miscsData) {
      enableMiscsQuery();
    }
    if (!isLoading) {
      if (miscsData) {
        const dataWithNestedRowData = miscsData.data?.miscs?.map(
          (row: MiscData) => {
            const rowCopy = { ...row };
            rowCopy.data = { ...row };
            return rowCopy;
          }
        );
        setTableData(dataWithNestedRowData);
      }
      if (miscsError) {
        console.error(miscsError);
        alertError(miscsError);
      }
      doneLoading();
    }
  }, [
    miscsData,
    isLoading,
    miscsError,
    doneLoading,
    alertError,
    enableMiscsQuery,
  ]);

  const createOrUpdateMisc = async (formData: MiscData) => {
    const editMode = mode === "edit";
    const reqBody = editMode
      ? formData
      : { ...formData, createdBy: auth?.user?.uid };
    const url = editMode
      ? "/miscs/" + modalData.miscUuid
      : "/miscs";
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
    setShowMiscModal(false);
  };

  const addMisc = () => {
    setModalData(null);
    setMode("create");
    setShowMiscModal(true);
  };

  const editMisc = (rowData: MiscData) => {
    setModalData(rowData);
    setMode("edit");
    setShowMiscModal(true);
  };

  const deleteMisc = async (miscUuid: string) => {
    const deleteMiscRequest = new APIRequest({
      baseURL: BREWERY_ROUTE,
      url: `/miscs/${miscUuid}`,
      method: "delete",
    });
    return deleteMiscRequest.request().catch(async (error: APIError) => {
      await alertErrorProm(error);
    });
  };

  const deleteRows = async (rowsDeleted: any) => {
    const miscUuidsToDelete = rowsDeleted.data.map(
      (row: { index: number; dataIndex: number }) => {
        return tableData[row.dataIndex].miscUuid;
      }
    );
    const qty = miscUuidsToDelete.length;
    const confirmResult = await confirmDelete(qty, "miscellaneous addition");
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
    for (const uuid of miscUuidsToDelete) {
      console.log("attempting to delete miscellaneous addition:", uuid);
      callAlert({message: `Deleting ${count} of ${miscUuidsToDelete.length} miscellaneous additions...`, showCloseButton: false});
      await deleteMisc(uuid);
      count ++;
    }
    resetAlertState();
    refresh();
    doneLoading();
  };

  const generatedColumns = generateColumnsFromInputs(miscInputs);
  const columns = [
    {
      label: "Misc ID",
      name: "miscUuid",
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
        "edit misc. addition",
        editMisc
      ),
    },
  ];
  return (
    <Page>
      <Tooltip title="add misc. addition">
        <IconButton onClick={addMisc}>
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
      {showMiscModal ? (
        <MiscModal
          showModal={showMiscModal}
          closeModal={() => setShowMiscModal(false)}
          mode={mode}
          data={modalData}
          onSubmit={createOrUpdateMisc}
        />
      ) : null}
    </Page>
  );
};

export default withLoadingSpinner(Miscs);
