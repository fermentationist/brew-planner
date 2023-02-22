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
import YeastModal, { yeastInputs } from "./YeastModal";
import { YeastData, Mode, APIError } from "../../types";

const Yeasts = ({
  startLoading,
  doneLoading,
}: {
  startLoading: () => void;
  doneLoading: () => void;
}) => {
  const [tableData, setTableData] = useState([]);
  const [showYeastModal, setShowYeastModal] = useState(false);
  const [mode, setMode]: [mode: Mode, setMode: Dispatch<SetStateAction<Mode>>] =
    useState("create" as Mode);
  const [modalData, setModalData] = useState(null);
  const { callAlert, alertError, alertErrorProm, resetAlertState } = useAlert();
  const { auth } = useAuth();
  const { confirmDelete, confirm } = useConfirm();
  const {
    isLoading,
    enable: enableYeastsQuery,
    data: yeastsData,
    error: yeastsError,
    refetch: refresh,
    APIRequest,
    BREWERY_ROUTE,
  } = useAPI("yeasts");
  const { generateColumnsFromInputs } = useConvertUnits();
  useEffect(() => {
    if (isLoading && !yeastsData) {
      enableYeastsQuery();
    }
    if (!isLoading) {
      if (yeastsData) {
        const dataWithNestedRowData = yeastsData.data?.yeasts?.map(
          (row: YeastData) => {
            const rowCopy = { ...row };
            rowCopy.data = { ...row };
            return rowCopy;
          }
        );
        setTableData(dataWithNestedRowData);
      }
      if (yeastsError) {
        console.error(yeastsError);
        alertError(yeastsError);
      }
      doneLoading();
    }
  }, [
    yeastsData,
    isLoading,
    yeastsError,
    doneLoading,
    alertError,
    enableYeastsQuery,
  ]);

  const createOrUpdateYeast = async (formData: YeastData) => {
    const editMode = mode === "edit";
    const reqBody = editMode
      ? formData
      : { ...formData, createdBy: auth?.user?.uid };
    const url = editMode
      ? "/yeasts/" + modalData.yeastUuid
      : "/yeasts";
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
    setShowYeastModal(false);
  };

  const addYeast = () => {
    setModalData(null);
    setMode("create");
    setShowYeastModal(true);
  };

  const editYeast = (rowData: YeastData) => {
    setModalData(rowData);
    setMode("edit");
    setShowYeastModal(true);
  };

  const deleteYeast = async (yeastUuid: string) => {
    const deleteYeastRequest = new APIRequest({
      baseURL: BREWERY_ROUTE,
      url: `/yeasts/${yeastUuid}`,
      method: "delete",
    });
    return deleteYeastRequest.request().catch(async (error: APIError) => {
      await alertErrorProm(error);
    });
  };

  const deleteRows = async (rowsDeleted: any) => {
    const yeastUuidsToDelete = rowsDeleted.data.map(
      (row: { index: number; dataIndex: number }) => {
        return tableData[row.dataIndex].yeastUuid;
      }
    );
    const qty = yeastUuidsToDelete.length;
    const confirmResult = await confirmDelete(qty, "yeast");
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
    for (const uuid of yeastUuidsToDelete) {
      console.log("attempting to delete yeast:", uuid);
      callAlert({message: `Deleting ${count} of ${yeastUuidsToDelete.length} yeasts...`, showCloseButton: false});
      await deleteYeast(uuid);
      count ++;
    }
    resetAlertState();
    refresh();
    doneLoading();
  };
  const generatedColumns = generateColumnsFromInputs(yeastInputs);
  const columns = [
    {
      label: "Yeast ID",
      name: "yeastUuid",
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
        "edit yeast",
        editYeast
      ),
    },
  ];
  return (
    <Page>
      <Tooltip title="add yeast">
        <IconButton onClick={addYeast}>
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
      {showYeastModal ? (
        <YeastModal
          showModal={showYeastModal}
          closeModal={() => setShowYeastModal(false)}
          mode={mode}
          data={modalData}
          onSubmit={createOrUpdateYeast}
        />
      ) : null}
    </Page>
  );
};

export default withLoadingSpinner(Yeasts);
