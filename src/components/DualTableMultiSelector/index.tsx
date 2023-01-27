import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import MuiButton from "@mui/material/Button";
import AddIcon from "@mui/icons-material/AddCircle";
import CreateIcon from "@mui/icons-material/Create";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";
import InputLabel from "@mui/material/InputLabel";
import styled from "styled-components";
import { styled as muiStyled } from "@mui/material/styles";
import { useState, useEffect, useCallback } from "react";
import CustomDialog from "../CustomDialog";
import DataTable, { getRowData } from "../DataTable";
import SimpleTable from "../SimpleTable";
import withDeepMemo from "../../hoc/withDeepMemo";

const StyledBox = muiStyled(Box)`
  margin: 1em;
`;

const Button = muiStyled(MuiButton)`
  margin-top: 1em;
`;

const StyledIconButton = muiStyled(IconButton)`
  padding: 0;
`;

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
`;

const ResponsiveDataTable = muiStyled(DataTable)`
  width: 300px;
  @media screen and (max-width: 600px) {
    max-width: 285px;
  }
`;

const StyledDialog = muiStyled(CustomDialog)`
  padding: 1em !important;
  @media screen and (max-width: 600px) {
    margin: 0;
  }
`;

const StyledSimpleTable = styled(SimpleTable)`
  width: 300px;
  @media screen and (max-width: 600px) {
    max-width: 285px;
  }
`;

export interface DualTableMultiSelectorProps {
  allOptions: any[];
  selectedOptions?: any[];
  optionKey: string;
  columns: any[];
  callback: (selection: any[]) => any;
  width?: string;
  title?: string;
  pluralTitle?: string;
  className?: string;
}

const DualTableMultiSelector = ({
  allOptions,
  optionKey, // the key of the option object that will be used in the callback array, i.e. if using "breweryUuid" as the optionKey, the component will return an array of breweryUuids when the callback is triggered
  selectedOptions = [], // an array of [optionKey] values
  columns, // columns to display in the tables
  callback, // callback to be called with the user's selection
  width,
  title,
  pluralTitle,
  className
}: DualTableMultiSelectorProps) => {
  
  const getInitialSelection = () =>
   (allOptions || []).filter(option => selectedOptions.includes(option[optionKey]));
  const memoizedGetInitialSelection = useCallback(getInitialSelection, [
    selectedOptions,
    allOptions,
    optionKey
  ]);

  const getInitialAvailableOptions = () =>
    (allOptions || []).filter(option => !selectedOptions.includes(option[optionKey]));
  const [currentSelection, setCurrentSelection] = useState(
    memoizedGetInitialSelection()
  );
  const [availableOptions, setAvailableOptions] = useState(
    getInitialAvailableOptions()
  );
  const [showSelectorModal, setShowSelectorModal] = useState(false);
  
  useEffect(() => {
    const filteredOptions = allOptions.filter(
      option =>
        !currentSelection
          .map(selOpt => selOpt[optionKey])
          .includes(option[optionKey])
    );
    setAvailableOptions(filteredOptions);
    callback(currentSelection.map(selOpt => selOpt[optionKey]));
  }, [currentSelection, optionKey, allOptions, callback]);

  useEffect(() => {
    setCurrentSelection(memoizedGetInitialSelection());
  }, [memoizedGetInitialSelection]);

  const addSelection = (rowData: any) => {
    setCurrentSelection([...currentSelection, rowData]);
  };
  const removeSelection = (rowData: any) => {
    const filteredSelection = currentSelection.filter(
      row => row[optionKey] !== rowData[optionKey]
    );
    setCurrentSelection(filteredSelection);
  };
  const selectedColumns = [
    ...columns,
    {
      label: "",
      name: "",
      options: {
        customBodyRender: (value: any, meta: any) => {
          return (
            <Tooltip title={`Remove${title ? " " + title : ""}`}>
              <StyledIconButton
                onClick={removeSelection.bind(this, meta.rowData)}
              >
                <DeleteIcon />
              </StyledIconButton>
            </Tooltip>
          );
        }
      }
    }
  ];
  const availableColumns = [
    ...columns,
    {
      label: "",
      name: "",
      options: {
        customBodyRender: (value: any, meta: any) => {
          return (
            <Tooltip title={`Add${title ? " " + title : ""}`}>
              <StyledIconButton
                onClick={addSelection.bind(this, getRowData(meta.rowData))}
              >
                <AddIcon />
              </StyledIconButton>
            </Tooltip>
          );
        }
      }
    }
  ];

  const availableTableOptions = {
    download: false,
    viewColumns: false,
    responsive: "standard",
    rowsPerPageOptions: [] as any[],
    jumpToPage: false
  };
  return (
    <StyledBox className={className}>
      <Stack>
        <FlexRow>
          <InputLabel>{pluralTitle ? pluralTitle : title ? `${title}s` : ""}</InputLabel>
          <Tooltip title={`Edit${title ? " " + title + "s" : ""}`}>
            <IconButton onClick={() => setShowSelectorModal(true)}>
              <CreateIcon />
            </IconButton>
          </Tooltip>
        </FlexRow>
        <SimpleTable columns={columns} data={currentSelection} elevation={7} />
        {
          showSelectorModal ? (
            <StyledDialog
              showDialog={showSelectorModal}
              closeDialog={() => setShowSelectorModal(false)}
            >
              <>
                <InputLabel>{`Selected${
                  pluralTitle ? pluralTitle : title ? `${title}s` : ""
                }`}</InputLabel>
                <StyledSimpleTable
                  columns={selectedColumns}
                  data={currentSelection}
                  containerComponent={Paper}
                  elevation={3}
                />
                <br />
                <Divider />
                <br />
                <InputLabel>{`Available${
                  pluralTitle ? pluralTitle : title ? `${title}s` : ""
                }`}</InputLabel>
                <ResponsiveDataTable
                  data={availableOptions}
                  columns={availableColumns}
                  width={width}
                  options={availableTableOptions}
                />
                <Button onClick={() => setShowSelectorModal(false)}>Close</Button>
              </>
            </StyledDialog>
          ) : null
        }
      </Stack>
    </StyledBox>
  );
};

// memoizing component so upstream API updates won't cause re-render
export default withDeepMemo(DualTableMultiSelector);
