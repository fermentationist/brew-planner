import { useState, useEffect, Dispatch, SetStateAction } from "react";
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
import EntityModal from "./EntityModal";
import { Mode, APIError } from "../../types";
import { FormInputOptions } from "../../components/FormModal";
import useDeeperMemo from "../../hooks/useDeeperMemo";

function EntityPage<EntityType>({
  startLoading,
  doneLoading,
  entityName,
  inputList = [],
  title,
  baseURL,
  pluralEntityName
}: {
  startLoading: () => void;
  doneLoading: () => void;
  entityName: string;
  inputList: FormInputOptions[];
  title?: string;
  baseURL?: string;
  pluralEntityName?: string;
}) {
  const [tableData, setTableData] = useState([]);
  const [showEntityModal, setShowEntityModal] = useState(false);
  const [mode, setMode]: [mode: Mode, setMode: Dispatch<SetStateAction<Mode>>] =
    useState("create" as Mode);
  const [modalData, setModalData] = useState(null);
  const { callAlert, alertError, alertErrorProm, resetAlertState } = useAlert();
  const { auth } = useAuth();
  const { confirmDelete, confirm } = useConfirm();
  const deepMemoize = useDeeperMemo();
  const {
    isLoading,
    enable: enableEntitiesQuery,
    data: entitiesData,
    error: entitiesError,
    refetch: refresh,
    APIRequest,
    breweryPath,
  } = useAPI(pluralEntityName || `${entityName}s`);
  const { generateColumnsFromInputs } = useConvertUnits();
  useEffect(() => {
    if (isLoading && !entitiesData) {
      enableEntitiesQuery();
    }
    if (!isLoading) {
      if (entitiesData) {
        const dataWithNestedRowData = entitiesData.data?.[
          pluralEntityName || `${entityName}s`
        ]?.map((row: EntityType & { data?: any }) => {
          const rowCopy = { ...row };
          rowCopy.data = { ...row };
          return rowCopy;
        });
        setTableData(dataWithNestedRowData);
      }
      if (entitiesError) {
        console.error(entitiesError);
        alertError(entitiesError);
      }
      doneLoading();
    }
  }, [
    entitiesData,
    isLoading,
    entitiesError,
    doneLoading,
    alertError,
    enableEntitiesQuery,
    entityName,
    pluralEntityName
  ]);

  const createOrUpdateEntity = async (formData: EntityType) => {
    const editMode = mode === "edit";
    const reqBody = editMode
      ? formData
      : { ...formData, createdBy: auth?.user?.uid };
    const url = editMode
      ? `/${pluralEntityName || entityName + "s"}/` + modalData[`${entityName}Uuid`]
      : `/${pluralEntityName || entityName + "s"}`;
    const apiReq = new APIRequest({
      baseURL: baseURL || breweryPath,
      url,
      method: editMode ? "patch" : "post",
      data: reqBody,
    });
    await apiReq.request().catch(async (error: APIError) => {
      await alertErrorProm(error);
    });
    refresh();
    setShowEntityModal(false);
  };

  const addEntity = () => {
    setModalData(null);
    setMode("create");
    setShowEntityModal(true);
  };

  const editEntity = (rowData: EntityType) => {
    setModalData(rowData);
    setMode("edit");
    setShowEntityModal(true);
  };

  const deleteEntity = async (entityUuid: string) => {
    const deleteEntityRequest = new APIRequest({
      baseURL: baseURL || breweryPath,
      url: `/${pluralEntityName || entityName + "s"}/${entityUuid}`,
      method: "delete",
    });
    return deleteEntityRequest.request().catch(async (error: APIError) => {
      await alertErrorProm(error);
    });
  };

  const deleteRows = async (rowsDeleted: any) => {
    const entityUuidsToDelete = rowsDeleted.data.map(
      (row: { index: number; dataIndex: number }) => {
        return tableData[row.dataIndex][`${entityName}Uuid`];
      }
    );
    console.log("entityUuidsToDelete:", entityUuidsToDelete);
    const qty = entityUuidsToDelete.length;
    const confirmResult = await confirmDelete(qty, title || entityName, pluralEntityName);
    if (!confirmResult) {
      return;
    }
    if (qty > 4) {
      const secondConfirm = await confirm(
        "Please be patient, this may take a little while..."
      );
      if (!secondConfirm) {
        return;
      }
    }
    startLoading();
    let count = 1;
    for (const uuid of entityUuidsToDelete) {
      console.log(`attempting to delete ${title || entityName}:`, uuid);
      callAlert({
        message: `Deleting ${count} of ${entityUuidsToDelete.length} ${
          pluralEntityName || title + "s" || entityName + "s"
        }`,
        showCloseButton: false,
      });
      await deleteEntity(uuid);
      count++;
    }
    resetAlertState();
    refresh();
    doneLoading();
  };
  const generatedColumns = generateColumnsFromInputs(inputList);
  const columns = [
    {
      label: `${entityName[0].toUpperCase() + entityName.slice(1)} ID`,
      name: `${entityName}Uuid`,
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
        `edit ${title || entityName}`,
        editEntity
      ),
    },
  ];
  return (
    <Page>
      <Tooltip title={`add ${title || entityName}`}>
        <IconButton onClick={addEntity}>
          <AddIcon />
        </IconButton>
      </Tooltip>
      <DataTable
        columns={deepMemoize(columns, `${entityName}Columns`)}
        data={tableData}
        refresh={refresh}
        options={{
          selectableRows: "multiple",
          selectableRowsHeader: true,
          onRowsDelete: deleteRows,
        }}
      />
      {showEntityModal ? (
        <EntityModal
          showModal={showEntityModal}
          closeModal={() => setShowEntityModal(false)}
          mode={mode}
          data={modalData}
          onSubmit={createOrUpdateEntity}
          inputList={inputList}
          title={
            (title || entityName)[0].toUpperCase() +
            (title || entityName).slice(1)
          }
        />
      ) : null}
    </Page>
  );
}

export default withLoadingSpinner(EntityPage);
