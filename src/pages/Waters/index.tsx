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
import WaterModal, { waterInputs } from "./WaterModal";
import { WaterData, Mode, APIError } from "../../types";

const Waters = ({
  startLoading,
  doneLoading,
}: {
  startLoading: () => void;
  doneLoading: () => void;
}) => {
  const [tableData, setTableData] = useState([]);
  const [showWaterModal, setShowWaterModal] = useState(false);
  const [mode, setMode]: [mode: Mode, setMode: Dispatch<SetStateAction<Mode>>] =
    useState("create" as Mode);
  const [modalData, setModalData] = useState(null);
  const { callAlert, alertError, alertErrorProm } = useAlert();
  const { auth } = useAuth();
  const { confirmDelete } = useConfirm();
  const {
    isLoading,
    enable: enableWatersQuery,
    data: watersData,
    error: watersError,
    refetch: refresh,
    APIRequest,
    BREWERY_ROUTE,
  } = useAPI("waters");
  const {
    renameTempPreferredUnits,
    generateColumnsFromInputs,
    preferredUnits,
  } = useConvertUnits();
  useEffect(() => {
    if (isLoading && !watersData) {
      enableWatersQuery();
    }
    if (!isLoading) {
      if (watersData) {
        const dataWithNestedRowData = watersData.data?.waters?.map(
          (row: WaterData) => {
            const rowCopy = { ...row };
            rowCopy.data = { ...row };
            return rowCopy;
          }
        );
        setTableData(dataWithNestedRowData);
      }
      if (watersError) {
        console.error(watersError);
        alertError(watersError);
      }
      doneLoading();
    }
  }, [
    watersData,
    isLoading,
    watersError,
    doneLoading,
    alertError,
    enableWatersQuery,
  ]);

  const createOrUpdateWater = async (formData: WaterData) => {
    const editMode = mode === "edit";
    const reqBody = editMode
      ? formData
      : { ...formData, createdBy: auth?.user?.uid };
    const url = editMode
      ? "/waters/" + modalData.waterUuid
      : "/waters";
    const apiReq = new APIRequest({
      baseURL: BREWERY_ROUTE,
      url,
      method: editMode ? "patch" : "post",
      data: reqBody,
    });
    const response = await apiReq.request().catch(async (error: APIError) => {
      await alertErrorProm(error);
    });
    // if response.data?.waterUuid is undefined, renameTempPreferredUnits will just delete the preferredUnits that were temporarily created by the WaterModal, otherwise it will rename them
    renameTempPreferredUnits(response.data?.waterUuid);
    refresh();
    setShowWaterModal(false);
  };

  const addWater = () => {
    setModalData(null);
    setMode("create");
    setShowWaterModal(true);
  };

  const editWater = (rowData: WaterData) => {
    setModalData(rowData);
    setMode("edit");
    setShowWaterModal(true);
  };

  const deleteWater = async (waterUuid: string) => {
    const deleteWaterRequest = new APIRequest({
      baseURL: BREWERY_ROUTE,
      url: `/waters/${waterUuid}`,
      method: "delete",
    });
    return deleteWaterRequest.request().catch(async (error: APIError) => {
      await alertErrorProm(error);
    });
  };

  const deleteRows = async (rowsDeleted: any) => {
    const waterUuidsToDelete = rowsDeleted.data.map(
      (row: { index: number; dataIndex: number }) => {
        return tableData[row.dataIndex].waterUuid;
      }
    );
    const qty = waterUuidsToDelete.length;
    const confirm = await confirmDelete(qty, "water profile");
    if (!confirm) {
      return;
    }
    if (qty > 1) {
      startLoading();
    }
    if (qty > 4) {
      callAlert("Please be patient, this may take a little while...");
    }
    for (const uuid of waterUuidsToDelete) {
      console.log("attempting to delete water profile:", uuid);
      await deleteWater(uuid);
    }
    refresh();
    doneLoading();
  };

  const generatedColumns = generateColumnsFromInputs(waterInputs);
  const columns = [
    {
      label: "Water ID",
      name: "waterUuid",
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
        "edit water profile",
        editWater
      ),
    },
  ];
  return (
    <Page>
      <Tooltip title="add water profile">
        <IconButton onClick={addWater}>
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
      {showWaterModal ? (
        <WaterModal
          showModal={showWaterModal}
          closeModal={() => setShowWaterModal(false)}
          mode={mode}
          data={modalData}
          onSubmit={createOrUpdateWater}
        />
      ) : null}
    </Page>
  );
};

export default withLoadingSpinner(Waters);
