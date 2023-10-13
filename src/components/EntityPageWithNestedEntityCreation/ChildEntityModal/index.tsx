import { useEffect, useState, useCallback } from "react";
import { styled as muiStyled } from "@mui/material/styles";
import CustomDialog from "../../CustomDialog";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/AddCircle";
import MuiButton from "@mui/material/Button";
import DataTable, { columnOptions } from "../../DataTable";
import useAPI from "../../../hooks/useAPI";
import useAlert from "../../../hooks/useAlert";
import useConvertUnits from "../../../hooks/useConvertUnits";

const StyledDialog = muiStyled(CustomDialog)`
  padding: 0.5em;
`;

const Button = muiStyled(MuiButton)`
  margin: 1em;
`;

const StyledDataTable = muiStyled(DataTable)`
  max-width: 95cqi;
  padding: 0.5em;
  @media screen and (max-width: 600px) {
    max-width: 80vw;
  }
`;

export const capitalize = (str: string) => {
  return str[0].toUpperCase() + str.slice(1);
};

const ChildEntityModal = ({
  showModal,
  closeModal,
  title,
  addEntity,
  editEntity,
  parentUuid,
  parentPath,
  childEntity,
  deleteChildRows,
}: {
  showModal: boolean;
  closeModal: () => void;
  title: string;
  addEntity: () => any;
  editEntity: (uuid: string) => any;
  parentPath: string;
  parentUuid: string;
  childEntity: any;
  deleteChildRows: (rows: any[]) => any;
}) => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [refreshNumber, setRefreshNumber] = useState(0);
  const { APIRequest, breweryPath } = useAPI();
  const { alertErrorProm } = useAlert();
  const { generateColumnsFromInputs } = useConvertUnits();

  const fetchSecondaryEntities = useCallback(
    async (uuid: string) => {
      const url = `${parentPath}/${uuid}/${childEntity.pathName}`;
      const getSecondaryEntities = new APIRequest({
        baseURL: breweryPath,
        url,
        method: "get",
      });
      const secondaryEntitiesResponse = await getSecondaryEntities
        .dispatch()
        .catch(alertErrorProm);
      return (
        secondaryEntitiesResponse.data?.[childEntity.pluralEntityName] ?? []
      );
    },
    [APIRequest, breweryPath, parentPath, childEntity, alertErrorProm]
  );

  useEffect(() => {
    fetchSecondaryEntities(parentUuid).then((secondaryEntities) => {
      setTableData(secondaryEntities);
    });
  }, [parentUuid, fetchSecondaryEntities, refreshNumber]);

  // this useEffect generates the columns for the secondary table
  useEffect(() => {
    const generatedColumns = generateColumnsFromInputs(childEntity.inputList);
    const cols = [
      {
        label: `${capitalize(childEntity.entityName)} ID`,
        name: `${childEntity.entityName}Uuid`,
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
          `edit ${childEntity.title ?? childEntity.entityName}`,
          editEntity
        ),
      },
    ];
    setColumns(cols);
  }, [childEntity, generateColumnsFromInputs, refreshNumber, editEntity]);

  const refresh = () => {
    setRefreshNumber(refreshNumber + Math.random());
  };
  return (
    <StyledDialog
      showDialog={showModal}
      closeDialog={closeModal}
      title={capitalize(title ?? childEntity.pluralTitle ?? childEntity.pluralEntityName)}
      className="child-entity-modal"
    >
      <>
        <Tooltip title={`add ${title}`}>
          <IconButton onClick={addEntity}>
            <AddIcon />
          </IconButton>
        </Tooltip>
        <StyledDataTable
          columns={columns}
          data={tableData}
          refresh={refresh}
          options={{
            selectableRows: "multiple",
            selectableRowsHeader: true,
            onRowsDelete: deleteChildRows,
            jumpToPage: false,
            pagination: false,
          }}
        />
        <Button onClick={closeModal}>Cancel</Button>
      </>
    </StyledDialog>
  );
};

export default ChildEntityModal;
