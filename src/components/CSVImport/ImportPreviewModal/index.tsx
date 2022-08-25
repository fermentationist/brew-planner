import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import MuiButton from "@mui/material/Button";
import LoadingSpinner from "../../LoadingSpinner";
import CustomDialog from "../../CustomDialog";
import DataTable from "../../DataTable";
import styled from "styled-components";
import { styled as muiStyled } from "@mui/material/styles";

const StyledSpinner = styled(LoadingSpinner)`
  margin-top: 0;
  margin-left: calc(15vw - 50px);
  opacity: 0.35;

  @media screen and (max-width: 600px) {
    margin-top: calc(5vh - 50px);
    margin-left: calc(38vw - 50px);
  }
`;

const StyledBox = muiStyled(Box)`
  margin: 1em;
`;

const ButtonContainer = styled.div`
  margin: 1em 0 1em 0;
`;

const Button = muiStyled(MuiButton)`
  margin: 1em;
  @media screen and (max-width: 600px) {
    margin: 0;
  }
`;

const StyledDialog = muiStyled(CustomDialog)`
  padding: 0 !important;
  width: 625px;
  overflow: auto;
  @media screen and (max-width: 600px) {
    max-width: 325px;
  }
`;

const StyledDataTable = styled(DataTable)`
  max-width: 575px;
  @media screen and (max-width: 600px) {
    max-width: 300px;
  }
`;

const ImportPreviewModal = ({
  showModal,
  closeModal,
  title,
  columns,
  data,
  onUpdate,
  onReplace
} : {
  showModal: boolean;
  closeModal: () => void;
  title?: string;
  columns: any[];
  data: any[];
  onUpdate: () => void;
  onReplace: () => void;
}) => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (columns.length) {
      setLoading(false);
    }
  }, [columns.length, columns, data, data.length]);
  return (
    <StyledDialog showDialog={showModal} closeDialog={closeModal} title={title}>
      <Stack>
        <StyledBox>
          {loading ? (
            <StyledSpinner />
          ) : (
            <StyledDataTable
              columns={columns}
              data={data}
              options={{ download: false, jumpToPage: false, rowsPerPage: 5, rowsPerPageOptions: [], responsive: "standard" }}
            />
            )}
        </StyledBox>
        <ButtonContainer>
          <Button onClick={closeModal}>Close</Button>
          {onUpdate ? <Button onClick={onUpdate}>Update table</Button> : null}
          {onReplace ? (
            <Button onClick={onReplace} color="warning">
              Replace table
            </Button>
          ) : null}
        </ButtonContainer>
      </Stack>
    </StyledDialog>
  );
};
export default ImportPreviewModal;
