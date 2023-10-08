import {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  useCallback,
  useRef,
} from "react";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/AddCircle";
import useAPI from "../../hooks/useAPI";
import DataTable, { columnOptions } from "../../components/DataTable";
import Page from "../../components/Page";
import withLoadingSpinner from "../../hoc/withLoadingSpinner";
import useAlert from "../../hooks/useAlert";
import useConfirm from "../../hooks/useConfirm";
import useConvertUnits from "../../hooks/useConvertUnits";
import EntityModal from "./EntityModal";
import { Mode, APIError } from "../../types";
import { FormInputOptions } from "../../components/FormModal";

export interface EntityOptions {
  entityName: string;
  inputList: FormInputOptions[];
  title?: string;
  baseURL?: string;
  pluralEntityName?: string;
  pathName?: string;
}

export interface EntityPageProps extends EntityOptions {
  startLoading?: () => void;
  doneLoading?: () => void;
}

const capitalize = (str: string) => {
  return str[0].toUpperCase() + str.slice(1);
}

function EntityPage<EntityType>({
  startLoading,
  doneLoading,
  entityName,
  inputList = [],
  title,
  baseURL,
  pluralEntityName,
  pathName,
}: {
  startLoading?: () => void;
  doneLoading?: () => void;
  entityName: string;
  inputList: FormInputOptions[];
  title?: string;
  baseURL?: string;
  pluralEntityName?: string;
  pathName?: string;
}) {
  const [tableData, setTableData] = useState([]);
  const [showEntityModal, setShowEntityModal] = useState(false);
  const [mode, setMode]: [mode: Mode, setMode: Dispatch<SetStateAction<Mode>>] =
    useState("create" as Mode);
  const [columns, setColumns] = useState([]);
  const [modalData, setModalData]: [modalData: EntityType, setModalData: Dispatch<SetStateAction<EntityType>>] = useState(null as EntityType);
  const modalStep = useRef(0);
  const [refreshNumber, setRefreshNumber] = useState(0);
  const { callAlert, alertError, alertErrorProm, resetAlertState } = useAlert();
  const { confirmDelete, confirm } = useConfirm();

  const {
    isLoading,
    enable: enableEntitiesQuery,
    data: entitiesData,
    error: entitiesError,
    refetch,
    APIRequest,
    breweryPath,
  } = useAPI(pluralEntityName ?? `${entityName}s`);
  const { generateColumnsFromInputs, renameTempPreferredUnits } =
    useConvertUnits();

  const refresh = useCallback(() => {
    // causes the table to re-render (in case the data is the same)
    setTableData([...tableData]);
    // causes the table to re-fetch data
    refetch();
    // causes the table to re-generate columns
    setRefreshNumber(refreshNumber + Math.random());
  }, [refetch, refreshNumber, setRefreshNumber, setTableData, tableData]);

  const editEntity = useCallback((rowData: EntityType) => {
    setModalData(rowData as EntityType);
    setMode("edit");
    setShowEntityModal(true);
  }, []);

  useEffect(() => {
    const generatedColumns = generateColumnsFromInputs(inputList);
    const cols = [
      {
        label: `${capitalize(entityName)} ID`,
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
          `edit ${title ?? entityName}`,
          editEntity
        ),
      },
    ];

    setColumns(cols);
  }, [
    generateColumnsFromInputs,
    inputList,
    editEntity,
    title,
    refreshNumber,
    entityName,
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
        setTableData(dataWithNestedRowData ?? []);
      }
      if (entitiesError) {
        console.error(entitiesError);
        alertError(entitiesError);
      }
      doneLoading && doneLoading();
    }
  }, [
    entitiesData,
    isLoading,
    entitiesError,
    doneLoading,
    alertError,
    enableEntitiesQuery,
    entityName,
    pluralEntityName,
  ]);

  const getCreateOrUpdateUrl = (
    editMode: boolean,
  ) => {
    if (editMode) {
      const entityUuid = (modalData as Record<string, any>)[`${entityName}Uuid`];
      return `${
        pathName ?? pluralEntityName ?? entityName + "s"
      }/${entityUuid}`;
    } 
    return pathName ?? pluralEntityName ?? entityName + "s";
  };

  const createOrUpdateEntity = async (formData: EntityType) => {
    console.log("modalStep.current in createOrUpdateEntity", modalStep.current);
    const editMode = mode === "edit";
    const reqBody = editMode ? formData : { ...formData };
    const url = getCreateOrUpdateUrl(editMode);
    const apiReq = new APIRequest({
      baseURL: baseURL || breweryPath,
      url,
      method: editMode ? "patch" : "post",
      data: reqBody,
    });
    const response = await apiReq
      .dispatch()
      .catch(async (error: APIError) => {
        await alertErrorProm(error);
      })
      .catch(async (error: APIError) => {
        console.error(error);
        await alertErrorProm(error);
      });
    if (!response) {
      setShowEntityModal(false);
      return;
    }
    renameTempPreferredUnits(response?.data?.uuid);
    setShowEntityModal(false);
    refresh();
    return response?.data?.uuid;
  };

  const addEntity = () => {
    setModalData(null);
    setMode("create");
    setShowEntityModal(true);
  };

  const deleteEntity = async (entityUuid: string) => {
    const deleteEntityRequest = new APIRequest({
      baseURL: baseURL || breweryPath,
      url: `/${pluralEntityName ?? entityName + "s"}/${entityUuid}`,
      method: "delete",
    });
    return deleteEntityRequest.dispatch().catch(async (error: APIError) => {
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
    const confirmResult = await confirmDelete(
      qty,
      title ?? entityName,
      pluralEntityName ?? entityName + "s"
    );
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
    startLoading && startLoading();
    let count = 1;
    for (const uuid of entityUuidsToDelete) {
      console.log(`attempting to delete ${title || entityName}:`, uuid);
      callAlert({
        message: `Deleting ${count} of ${entityUuidsToDelete.length} ${
          pluralEntityName ?? (title && title + "s") ?? entityName + "s"
        }`,
        showCloseButton: false,
      });
      await deleteEntity(uuid);
      count++;
    }
    resetAlertState();
    refresh();
    doneLoading && doneLoading();
  };

  return (
    <Page>
      <Tooltip title={`add ${title ?? entityName}`}>
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
            capitalize(title ?? entityName)
          }
          refresh={refresh}
        />
      ) : null}
    </Page>
  );
}

export default withLoadingSpinner(EntityPage);
