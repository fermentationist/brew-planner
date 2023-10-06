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
  numModalSteps = 1,
  submitEachModalStep,
  stepKeys = [],
}: {
  startLoading: () => void;
  doneLoading: () => void;
  entityName: string | string[];
  inputList: FormInputOptions[];
  title?: string | string[];
  baseURL?: string;
  pluralEntityName?: string | string[];
  numModalSteps?: number;
  submitEachModalStep?: boolean;
  stepKeys?: string[];
}) {
  const [tableData, setTableData] = useState([]);
  const [showEntityModal, setShowEntityModal] = useState(false);
  const [mode, setMode]: [mode: Mode, setMode: Dispatch<SetStateAction<Mode>>] =
    useState("create" as Mode);
  const [columns, setColumns] = useState([]);
  const [modalData, setModalData] = useState(null);
  const modalStep = useRef(0);
  const modalTitle = useRef(Array.isArray(title) ? title[0] : title ?? "");
  const urlPath = useRef("");
  const [refreshNumber, setRefreshNumber] = useState(0);
  const { callAlert, alertError, alertErrorProm, resetAlertState } = useAlert();
  const { confirmDelete, confirm } = useConfirm();

  const getEntityNameString = useCallback((stepNum?: number) => {
    return Array.isArray(entityName) ? entityName[stepNum ?? modalStep.current] : entityName;
  }, [entityName]);

  const getPluralEntityNameString = useCallback((stepNum?: number) => {
    return Array.isArray(pluralEntityName) ? pluralEntityName[stepNum ?? modalStep.current] : pluralEntityName;
  }, [pluralEntityName]);

  const getTitleString = useCallback((stepNum?: number) => {
    return Array.isArray(title) ? title[stepNum ?? modalStep.current] : title;
  }, [title]);

  const {
    isLoading,
    enable: enableEntitiesQuery,
    data: entitiesData,
    error: entitiesError,
    refetch,
    APIRequest,
    breweryPath,
  } = useAPI(getPluralEntityNameString(0) ?? `${getEntityNameString(0)}s`);
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
    const generatedColumns = generateColumnsFromInputs(inputList);
    const cols = [
      {
        label: `${
          getEntityNameString(0)[0].toUpperCase() + getEntityNameString(0).slice(1)
        } ID`,
        name: `${getEntityNameString(0)}Uuid`,
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
          `edit ${getTitleString(0) || getEntityNameString(0)}`,
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
    getEntityNameString,
    getTitleString,
  ]);

  useEffect(() => {
    if (isLoading && !entitiesData) {
      enableEntitiesQuery();
    }
    if (!isLoading) {
      if (entitiesData) {
        const dataWithNestedRowData = entitiesData.data?.[
          getPluralEntityNameString(0) || `${getEntityNameString(0)}s`
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
    getEntityNameString,
    getPluralEntityNameString,
  ]);

  const getCreateOrUpdateUrl = (
    editMode: boolean,
    stepNum: number,
    formData: EntityType
  ) => {
    let path;
    const entityNameString = getEntityNameString(stepNum);
    const pluralEntityNameString = getPluralEntityNameString(stepNum);
    if (editMode) {
      const entityUuid =
        stepKeys && stepKeys.length
          ? modalData[stepKeys[stepNum]] ??
            (formData as Record<string, any>)[stepKeys[stepNum]]
          : modalData[`${entityNameString}Uuid`] ??
            (formData as Record<string, any>)[`${entityNameString}Uuid`];
      path = `${urlPath.current ? `${urlPath.current}/` : ""}${
        pluralEntityNameString || entityNameString + "s"
      }/${entityUuid}`;
      urlPath.current = path;
      console.log("path a", path);
      return path;
    }
    if (urlPath.current) {
      console.log("url path", urlPath.current);
      const prevEntityUuid =
        stepKeys && stepKeys.length
          ? (modalData && modalData[stepKeys[stepNum - 1]]) ??
            (formData as Record<string, any>)[stepKeys[stepNum - 1]]
          : (modalData && modalData[`${entityName[modalStep.current - 1]}Uuid`]) ??
            (formData as Record<string, any>)[
              `${entityName[modalStep.current - 1]}Uuid`
            ];
      path = `${urlPath.current}/${prevEntityUuid}/${
        pluralEntityNameString ?? entityNameString + "s"
      }`;
      console.log("path b", path);
      urlPath.current += path;
      return path;
    }
    path = pluralEntityNameString ?? entityNameString + "s";
    console.log("path c", path);
    urlPath.current = path;
    return path;
  };

  const createOrUpdateEntity = async (formData: EntityType) => {
    console.log("modalStep.current in createOrUpdateEntity", modalStep.current);
    const editMode = mode === "edit";
    const reqBody = editMode ? formData : { ...formData };
    const url = getCreateOrUpdateUrl(editMode, modalStep.current, formData);
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
    if (modalStep.current === numModalSteps - 1) {
      renameTempPreferredUnits(response?.data?.uuid);
      setShowEntityModal(false);
    }
    modalStep.current += 1;
    modalTitle.current = getTitleString(modalStep.current);
    console.log("modalTitle.current:", modalTitle.current);
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
      url: `/${getPluralEntityNameString(0) ?? getEntityNameString(0) + "s"}/${entityUuid}`,
      method: "delete",
    });
    return deleteEntityRequest.dispatch().catch(async (error: APIError) => {
      await alertErrorProm(error);
    });
  };

  const deleteRows = async (rowsDeleted: any) => {
    const entityUuidsToDelete = rowsDeleted.data.map(
      (row: { index: number; dataIndex: number }) => {
        return tableData[row.dataIndex][`${getEntityNameString(0)}Uuid`];
      }
    );
    const qty = entityUuidsToDelete.length;
    const confirmResult = await confirmDelete(
      qty,
      getTitleString(0) || getEntityNameString(0),
      getPluralEntityNameString(0)
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
      const entityNameString = getEntityNameString(0);
      const mainTitle = getTitleString(0);
      console.log(`attempting to delete ${mainTitle || entityNameString}:`, uuid);
      callAlert({
        message: `Deleting ${count} of ${entityUuidsToDelete.length} ${
          getPluralEntityNameString(0) ?? (mainTitle && mainTitle + "s") ?? entityNameString + "s"
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
      <Tooltip title={`add ${getTitleString() || getEntityNameString()}`}>
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
            capitalize(modalTitle.current ?? getEntityNameString())
          }
          refresh={refresh}
          numSteps={numModalSteps}
          submitEachStep={submitEachModalStep}
          stepKeys={stepKeys}
        />
      ) : null}
    </Page>
  );
}

export default withLoadingSpinner(EntityPage);
