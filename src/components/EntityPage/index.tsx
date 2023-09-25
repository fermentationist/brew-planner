import { useState, useEffect, Dispatch, SetStateAction, useCallback } from "react";
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
  const [columns, setColumns] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [refreshNumber, setRefreshNumber] = useState(0);
  const { callAlert, alertError, alertErrorProm, resetAlertState } = useAlert();
  const { auth } = useAuth();
  const { confirmDelete, confirm } = useConfirm();
  const {
    isLoading,
    enable: enableEntitiesQuery,
    data: entitiesData,
    error: entitiesError,
    refetch,
    APIRequest,
    breweryPath,
  } = useAPI(pluralEntityName || `${entityName}s`);
  const { generateColumnsFromInputs, renameTempPreferredUnits } = useConvertUnits();

  const refresh = useCallback(() => {
    console.log("refreshing...");
    setTableData([]);
    refetch();
    setRefreshNumber(refreshNumber + Math.random());
  }, [refetch, refreshNumber, setRefreshNumber, setTableData]);

  const editEntity = useCallback((rowData: EntityType) => {
    setModalData(rowData);
    setMode("edit");
    setShowEntityModal(true);
  }, []);

  useEffect(() => {
    console.log("generating columns...");
    const generatedColumns = generateColumnsFromInputs(inputList);
    const cols = [
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
  
  setColumns(cols);
  }, [
    generateColumnsFromInputs, 
    inputList, 
    editEntity, 
    entityName, 
    title,
    refreshNumber
  ]);

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
    const response = await apiReq.request().catch(async (error: APIError) => {
      await alertErrorProm(error);
    });
    renameTempPreferredUnits(response?.data?.uuid);
    refresh();
    setShowEntityModal(false);
  };

  const addEntity = () => {
    setModalData(null);
    setMode("create");
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
  
  return (
    <Page>
      <Tooltip title={`add ${title || entityName}`}>
        <IconButton onClick={addEntity}>
          <AddIcon />
        </IconButton>
      </Tooltip>
      <DataTable
        columns={columns}
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
          refresh={refresh}
        />
      ) : null}
    </Page>
  );
}

export default withLoadingSpinner(EntityPage);
