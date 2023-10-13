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
import ChildEntityModal from "./ChildEntityModal";
import { Mode as EditMode, APIError } from "../../types";
import { EntityOptions as _EntityOptions } from "../EntityPage";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EntityOptions extends _EntityOptions {}

export interface EntityPageWithNestedEntityCreationOptions {
  primaryEntity: EntityOptions;
  secondaryEntity: EntityOptions;
}

export interface EntityPageWithNestedEntityCreationProps
  extends EntityPageWithNestedEntityCreationOptions {
  startLoading?: () => void;
  doneLoading?: () => void;
}

export const capitalize = (str: string) => {
  return str[0].toUpperCase() + str.slice(1);
};

function EntityPageWithNestedEntityCreation<EntityType>({
  primaryEntity,
  secondaryEntity,
  startLoading,
  doneLoading,
}: EntityPageWithNestedEntityCreationProps) {
  const [tableData, setTableData] = useState([]);
  const [showEntityModal, setShowEntityModal] = useState(false);
  const [editMode, setEditMode]: [
    editMode: EditMode,
    setEditMode: Dispatch<SetStateAction<EditMode>>
  ] = useState("create" as EditMode);
  const [columns, setColumns] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [refreshNumber, setRefreshNumber] = useState(0);
  const [modalStartStage, setModalStartStage] = useState("primary");
  const [showChildEntityModal, setShowChildEntityModal] = useState(false);
  const [childModalParentEntityUuid, setChildModalParentEntityUuid] = useState(
    null
  );
  const { callAlert, alertError, alertErrorProm, resetAlertState } = useAlert();
  const { confirmDelete, confirm } = useConfirm();

  const {
    isLoading: primaryEntityIsLoading,
    enable: enablePrimaryEntitiesQuery,
    data: primaryEntitiesData,
    error: primaryEntitiesError,
    refetch: primaryEntitiesRefetch,
    APIRequest,
    breweryPath,
  } = useAPI(
    primaryEntity.pathName ??
      primaryEntity.pluralEntityName ??
      `${primaryEntity.entityName}s`
  );

  const { generateColumnsFromInputs, renameTempPreferredUnits } =
    useConvertUnits();

  const refresh = useCallback(() => {
    // causes the table to re-render (in case the data is the same)
    setTableData([...tableData]);
    // causes the table to re-fetch data
    primaryEntitiesRefetch();
    // causes the table to re-generate columns
    setRefreshNumber(refreshNumber + Math.random());
  }, [
    primaryEntitiesRefetch,
    refreshNumber,
    setRefreshNumber,
    setTableData,
    tableData,
  ]);

  const editEntity = useCallback((rowData: EntityType) => {
    setModalData(rowData);
    setEditMode("edit");
    setShowEntityModal(true);
  }, []);

  const viewSecondaryEntities = useCallback((rowData?: EntityType) => {
    if (rowData) {
      setModalData(rowData);
    }
    setModalStartStage("secondary");
    setShowEntityModal(true);
  }, [setModalData]);

  // this useEffect generates the columns for the primary table
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
        name:
          secondaryEntity.pluralTitle ??
          secondaryEntity.pluralEntityName ??
          secondaryEntity.entityName + "s",
        options: columnOptions.createRenderChildEntitiesButtonOptions(
          `view ${
            secondaryEntity.pluralTitle ??
            secondaryEntity.pluralEntityName ??
            secondaryEntity.entityName + "s"
          }`,
          viewSecondaryEntities
        ),
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
    primaryEntity,
    secondaryEntity,
    refreshNumber,
    editEntity,
    viewSecondaryEntities,
  ]);

  // this useEffect loads the primary table data
  useEffect(() => {
    if (primaryEntityIsLoading && !primaryEntitiesData) {
      enablePrimaryEntitiesQuery();
    }
    if (!primaryEntityIsLoading) {
      if (primaryEntitiesData) {
        const dataWithNestedRowData = primaryEntitiesData.data?.[
          primaryEntity.pluralEntityName || `${primaryEntity.entityName}s`
        ]?.map((row: EntityType & { data?: any }) => {
          const rowCopy = { ...row };
          rowCopy.data = { ...row };
          return rowCopy;
        });
        setTableData(dataWithNestedRowData ?? []);
      }
      if (primaryEntitiesError) {
        console.error(primaryEntitiesError);
        alertError(primaryEntitiesError);
      }
      doneLoading();
    }
  }, [
    primaryEntitiesData,
    primaryEntityIsLoading,
    primaryEntitiesError,
    doneLoading,
    alertError,
    enablePrimaryEntitiesQuery,
    primaryEntity.entityName,
    primaryEntity.pluralEntityName,
  ]);

  const getPrimaryPathName = () => {
    return (
      primaryEntity.pathName ??
      primaryEntity.pluralEntityName ??
      primaryEntity.entityName + "s"
    );
  };

  const getCreateOrUpdateUrl = (
    editMode: boolean,
    isPrimary: boolean,
    primaryEntityUuid?: string
  ) => {
    if (editMode) {
      const entityUuid = modalData[`${primaryEntity.entityName}Uuid`];
      return `${
        primaryEntity.pathName ??
        primaryEntity.pluralEntityName ??
        primaryEntity.entityName + "s"
      }/${entityUuid}`;
    }
    if (isPrimary) {
      return getPrimaryPathName();
    }
    return `${getPrimaryPathName()}/${primaryEntityUuid}/${
      secondaryEntity.pathName ??
      secondaryEntity.pluralEntityName ??
      secondaryEntity.entityName + "s"
    }`;
  };

  const createOrUpdateEntity = async (
    formData: EntityType,
    isPrimary: boolean,
    primaryEntityUuid?: string
  ) => {
    const isEditMode = editMode === "edit";
    const reqBody = isEditMode ? formData : { ...formData };
    const url = getCreateOrUpdateUrl(isEditMode, isPrimary, primaryEntityUuid);
    const apiReq = new APIRequest({
      baseURL: primaryEntity.baseURL || breweryPath,
      url,
      method: isEditMode ? "patch" : "post",
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
    // setShowEntityModal(false);
    refresh();
    return response?.data?.uuid;
  };

  const addEntity = () => {
    setModalData(null);
    setEditMode("create");
    setShowEntityModal(true);
  };

  const deleteEntity = async (entityUuid: string) => {
    const deleteEntityRequest = new APIRequest({
      baseURL: primaryEntity.baseURL || breweryPath,
      url: `/${
        primaryEntity.pluralEntityName ?? primaryEntity.entityName + "s"
      }/${entityUuid}`,
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
      console.log(
        `attempting to delete ${
          primaryEntity.title || primaryEntity.entityName
        }:`,
        uuid
      );
      callAlert({
        message: `Deleting ${count} of ${entityUuidsToDelete.length} ${
          primaryEntity.pluralEntityName ??
          (primaryEntity.title && primaryEntity.title + "s") ??
          primaryEntity.entityName + "s"
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
          editMode={editMode}
          data={modalData}
          onSubmit={createOrUpdateEntity}
          primaryEntity={primaryEntity}
          secondaryEntity={secondaryEntity}
          title={capitalize(primaryEntity.title ?? primaryEntity.entityName)}
          refresh={refresh}
          startStage={modalStartStage}
        />
      ) : null}
      {/* {showChildEntityModal ? (
        <ChildEntityModal
          showModal={showChildEntityModal}
          closeModal={closeChildEntityModal}
          title={capitalize(
            secondaryEntity.title ?? secondaryEntity.entityName
          )}
          addEntity={addSecondaryEntity}
          editEntity={viewSecondaryEntities}
          parentPath={
            primaryEntity.pathName ??
            primaryEntity.pluralEntityName ??
            primaryEntity.entityName + "s"
          }
          parentUuid={childModalParentEntityUuid}
          childEntity={secondaryEntity}
          deleteChildRows={deleteSecondaryRows}
        />
      ) : null} */}
    </Page>
  );
}

export default withLoadingSpinner(EntityPageWithNestedEntityCreation);
