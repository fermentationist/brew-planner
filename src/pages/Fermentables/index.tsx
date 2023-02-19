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
import FermentableModal, { fermentableInputs } from "./FermentableModal";
import { FermentableData, Mode, APIError } from "../../types";

const Fermentables = ({
  startLoading,
  doneLoading,
}: {
  startLoading: () => void;
  doneLoading: () => void;
}) => {
  const [tableData, setTableData] = useState([]);
  const [showFermentableModal, setShowFermentableModal] = useState(false);
  const [mode, setMode]: [mode: Mode, setMode: Dispatch<SetStateAction<Mode>>] =
    useState("create" as Mode);
  const [modalData, setModalData] = useState(null);
  const { callAlert, alertError, alertErrorProm } = useAlert();
  const { auth } = useAuth();
  const { confirmDelete } = useConfirm();
  const {
    isLoading,
    enable: enableFermentablesQuery,
    data: fermentablesData,
    error: fermentablesError,
    refetch: refresh,
    APIRequest,
    BREWERY_ROUTE,
  } = useAPI("fermentables");
  const {
    renameTempPreferredUnits,
    generateColumnsFromInputs,
    preferredUnits,
  } = useConvertUnits();
  useEffect(() => {
    if (isLoading && !fermentablesData) {
      enableFermentablesQuery();
    }
    if (!isLoading) {
      if (fermentablesData) {
        const dataWithNestedRowData = fermentablesData.data?.fermentables?.map(
          (row: FermentableData) => {
            const rowCopy = { ...row };
            rowCopy.data = { ...row };
            return rowCopy;
          }
        );
        setTableData(dataWithNestedRowData);
      }
      if (fermentablesError) {
        console.error(fermentablesError);
        alertError(fermentablesError);
      }
      doneLoading();
    }
  }, [
    fermentablesData,
    isLoading,
    fermentablesError,
    doneLoading,
    alertError,
    enableFermentablesQuery,
  ]);

  const createOrUpdateFermentable = async (formData: FermentableData) => {
    const editMode = mode === "edit";
    const reqBody = editMode
      ? formData
      : { ...formData, createdBy: auth?.user?.uid };
    // reqBody.recommendedMash = reqBody.recommendedMash === "true" ? true : reqBody.recommendedMash === "false" ? false : reqBody.recommendedMash;
    const url = editMode
      ? "/fermentables/" + modalData.fermentableUuid
      : "/fermentables";
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
    setShowFermentableModal(false);
  };

  const addFermentable = () => {
    setModalData(null);
    setMode("create");
    setShowFermentableModal(true);
  };

  const editFermentable = (rowData: FermentableData) => {
    setModalData(rowData);
    setMode("edit");
    setShowFermentableModal(true);
  };

  const deleteFermentable = async (fermentableUuid: string) => {
    const deleteFermentableRequest = new APIRequest({
      baseURL: BREWERY_ROUTE,
      url: `/fermentables/${fermentableUuid}`,
      method: "delete"
    });
    return deleteFermentableRequest.request().catch(async(error: APIError) => {
      await alertErrorProm(error);
    })
  }

  const deleteRows = async (rowsDeleted: any) => {
    const fermentableUuidsToDelete = rowsDeleted.data.map(
      (row: { index: number; dataIndex: number }) => {
        return tableData[row.dataIndex].fermentableUuid;
      }
    );
    const qty = fermentableUuidsToDelete.length;
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
    for (const uuid of fermentableUuidsToDelete) {
      console.log("attempting to delete fermentable:", uuid);
      await deleteFermentable(uuid);
    }
    refresh();
    doneLoading();
  };

  const generatedColumns = generateColumnsFromInputs(fermentableInputs);
  const columns = [
    {
      label: "Fermentable ID",
      name: "fermentableUuid",
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
        "edit fermentable",
        editFermentable
      ),
    },
  ];
  return (
    <Page>
      <Tooltip title="Add Fermentable">
        <IconButton onClick={addFermentable}>
          <AddIcon />
        </IconButton>
      </Tooltip>
      <DataTable
        columns={useMemo(() => columns, [preferredUnits])}
        data={tableData}
        refresh={refresh}
        options={{
          selectableRows: "multiple",
          selectableRowsHeader: true,
          onRowsDelete: deleteRows,
        }}
      />
      {showFermentableModal ? (
        <FermentableModal
          showModal={showFermentableModal}
          closeModal={() => setShowFermentableModal(false)}
          mode={mode}
          data={modalData}
          onSubmit={createOrUpdateFermentable}
        />
      ) : null}
    </Page>
  );
};

export default withLoadingSpinner(Fermentables);
