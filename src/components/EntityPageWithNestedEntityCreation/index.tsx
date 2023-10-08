import {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  useCallback,
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
import EntityWithNestedEntityCreationModal from "./EntityWithNestedEntityCreationModal";
import { Mode, APIError } from "../../types";
import { EntityOptions as _EntityOptions } from "../EntityPage";
import { FormInputOptions } from "../FormModal";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EntityOptions extends _EntityOptions {}

export interface SecondaryEntityOptions extends EntityOptions {
  dependency: string;
}

export interface EntityPageWithNestedEntityCreationOptions {
  primaryEntity: EntityOptions;
  secondaryEntity: SecondaryEntityOptions;
}

export interface EntityPageWithNestedEntityCreationProps
  extends EntityPageWithNestedEntityCreationOptions {
  startLoading?: () => void;
  doneLoading?: () => void;
}

const capitalize = (str: string) => {
  return str[0].toUpperCase() + str.slice(1);
}

function EntityPageWithNestedEntityCreation<EntityType>({
  primaryEntity,
  secondaryEntity,
  startLoading,
  doneLoading,
}: EntityPageWithNestedEntityCreationProps) {
  const [tableData, setTableData] = useState([]);
  const [showEntityModal, setShowEntityModal] = useState(false);
  const [mode, setMode]: [mode: Mode, setMode: Dispatch<SetStateAction<Mode>>] =
    useState("create" as Mode);
  const [columns, setColumns] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [isPrimaryStep, setIsPrimaryStep] = useState(true);
  const [inputSteps, setInputSteps] = useState([primaryEntity.inputList, secondaryEntity.inputList] as FormInputOptions[][]);
  const [primaryEntityUuid, setPrimaryEntityUuid] = useState("");
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
  } = useAPI(primaryEntity.pluralEntityName ?? `${primaryEntity.entityName}s`);
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
    setModalData(rowData);
    setMode("edit");
    setShowEntityModal(true);
  }, []);

  useEffect(() => {
    const generatedColumns = generateColumnsFromInputs(primaryEntity.inputList);
    const cols = [
      {
        label: `${capitalize(primaryEntity.entityName)} ID`,
        name: `${primaryEntity.entityName}Uuid`,
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
          `edit ${primaryEntity.title ?? primaryEntity.entityName}`,
          editEntity
        ),
      },
    ];

    setColumns(cols);
  }, [
    generateColumnsFromInputs,
    primaryEntity.inputList,
    editEntity,
    primaryEntity.title,
    refreshNumber,
    primaryEntity.entityName,
  ]);

  useEffect(() => {
    if (isLoading && !entitiesData) {
      enableEntitiesQuery();
    }
    if (!isLoading) {
      if (entitiesData) {
        const dataWithNestedRowData = entitiesData.data?.[
          primaryEntity.pluralEntityName || `${primaryEntity.entityName}s`
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
      doneLoading();
    }
  }, [
    entitiesData,
    isLoading,
    entitiesError,
    doneLoading,
    alertError,
    enableEntitiesQuery,
    primaryEntity.entityName,
    primaryEntity.pluralEntityName,
  ]);

  const getPrimaryPathName = () => {
    return primaryEntity.pathName ?? primaryEntity.pluralEntityName ?? primaryEntity.entityName + "s";
  }

  const getCreateOrUpdateUrl = (
    editMode: boolean,
    isPrimary: boolean
  ) => {
    if (editMode) {
      const entityUuid = modalData[`${primaryEntity.entityName}Uuid`];
      return `${
        primaryEntity.pathName ?? primaryEntity.pluralEntityName ?? primaryEntity.entityName + "s"
      }/${entityUuid}`;
    } 
    if (isPrimary) {
      return getPrimaryPathName();
    }
    return `${getPrimaryPathName}/${primaryEntityUuid}/${secondaryEntity.pathName ?? secondaryEntity.pluralEntityName ?? secondaryEntity.entityName + "s"}`;
  };

  const createOrUpdateEntity = async (formData: EntityType, isPrimary: boolean) => {
    const editMode = mode === "edit";
    const reqBody = editMode ? formData : { ...formData };
    const url = getCreateOrUpdateUrl(editMode, isPrimary);
    const apiReq = new APIRequest({
      baseURL: primaryEntity.baseURL || breweryPath,
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
      baseURL: primaryEntity.baseURL || breweryPath,
      url: `/${primaryEntity.pluralEntityName ?? primaryEntity.entityName + "s"}/${entityUuid}`,
      method: "delete",
    });
    return deleteEntityRequest.dispatch().catch(async (error: APIError) => {
      await alertErrorProm(error);
    });
  };

  const deleteRows = async (rowsDeleted: any) => {
    const entityUuidsToDelete = rowsDeleted.data.map(
      (row: { index: number; dataIndex: number }) => {
        return tableData[row.dataIndex][`${primaryEntity.entityName}Uuid`];
      }
    );
    const qty = entityUuidsToDelete.length;
    const confirmResult = await confirmDelete(
      qty,
      primaryEntity.title ?? primaryEntity.entityName,
      primaryEntity.pluralEntityName ?? primaryEntity.entityName + "s"
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
    startLoading();
    let count = 1;
    for (const uuid of entityUuidsToDelete) {
      console.log(`attempting to delete ${primaryEntity.title || primaryEntity.entityName}:`, uuid);
      callAlert({
        message: `Deleting ${count} of ${entityUuidsToDelete.length} ${
          primaryEntity.pluralEntityName ?? (primaryEntity.title && primaryEntity.title + "s") ?? primaryEntity.entityName + "s"
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

  const askForNextStep = (currentStep: number) => {
    //
  }

  const onIntermediateSubmit = async (formData: EntityType) => {
    //
    const uuid = await createOrUpdateEntity(formData, isPrimaryStep);
    if (uuid && isPrimaryStep) {
      setPrimaryEntityUuid(uuid);
      setIsPrimaryStep(false);
    }
  };

  return (
    <Page>
      <Tooltip title={`add ${primaryEntity.title ?? primaryEntity.entityName}`}>
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
        <EntityWithNestedEntityCreationModal
          showModal={showEntityModal}
          closeModal={() => setShowEntityModal(false)}
          mode={mode}
          data={modalData}
          onSubmit={onIntermediateSubmit}
          inputList={isPrimaryStep ? primaryEntity.inputList : secondaryEntity.inputList} 
          title={
            capitalize(primaryEntity.title ?? primaryEntity.entityName)
          }
          refresh={refresh}
        />
      ) : null}
    </Page>
  );
}

export default withLoadingSpinner(EntityPageWithNestedEntityCreation);
