import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/lab/LoadingButton";
import { ChildProps } from "../../types/";
import { styled as muiStyled } from "@mui/material/styles";

export interface CustomDialogProps {
  showDialog: boolean;
  closeDialog: () => void;
  className?: string;
  title?: string;
  confirm?: () => void;
  loading?: boolean;
  children?: ChildProps;
}

const StyledDialog = muiStyled(Dialog)`
  padding: 0.5em;
  // min-width: 10vw;
  @media screen and (max-width: 600px) {
    min-width: 95vw;
  }
  div[role="dialog"] {
    // display: none;
    container-type: inline-size;
    @media screen and (max-width: 600px) {
      min-width: 90vw;

    }
  }
`;

const StyledContent = muiStyled(DialogContent)`
  padding-top: 1em !important;
  margin-top: 1em;
  max-width: 93cqi;
  container-type: inline-size;
`;

const CustomDialog = ({
  showDialog,
  closeDialog,
  className,
  children,
  title,
  confirm,
  loading,
}: CustomDialogProps) => {
  return (
    <>
      {showDialog ? (
        <StyledDialog
          open={showDialog}
          onClose={closeDialog}
          className={`custom-dialog${className ? ` ${className}` : ""}`}
        >
          {title ? <DialogTitle>{title}</DialogTitle> : null}
          <StyledContent className={`custom-dialog-content${className ? ` ${className}` : ""}`}>{children}</StyledContent>
          {confirm ? (
            <DialogActions>
              <Button
                onClick={() => {
                  closeDialog();
                  return false;
                }}
              >
                Cancel
              </Button>
              <Button onClick={confirm} loading={loading}>
                Confirm
              </Button>
            </DialogActions>
          ) : null}
        </StyledDialog>
      ) : null}
    </>
  );
};

export default CustomDialog;
