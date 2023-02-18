import { useState, useEffect, useMemo } from "react";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/AddCircle";
import useAPI from "../../hooks/useAPI";
import DataTable from "../../components/DataTable";
import Page from "../../components/Page";
import withLoadingSpinner from "../../hoc/withLoadingSpinner";
import useAlert from "../../hooks/useAlert";
import useConvertUnits from "../../hooks/useConvertUnits";
import FermentableModal, { fermentableInputs } from "./FermentableModal";
import { FermentablesData, Mode } from "../../types";

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
  const { alertError } = useAlert();
  const {
    isLoading,
    enable: enableFermentablesQuery,
    data: fermentablesData,
    error: fermentablesError,
    refetch: refresh
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
          (row: FermentablesData) => {
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

  const createOrUpdateFermentable = (formData) => {
    console.log("formData:", formData);
  };

  const addFermentable = () => {
    setModalData(null);
    setMode("create");
    setShowFermentableModal(true);
  };

  const editFermentable = rowData => {
    setModalData(rowData);
    setMode("edit");
    setShowFermentableModal(true);
  }

  const deleteRows = () => {
// 
  }

  const generatedColumns = generateColumnsFromInputs(fermentableInputs);
  const columns = [...generatedColumns];
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
        options=
        {{
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
