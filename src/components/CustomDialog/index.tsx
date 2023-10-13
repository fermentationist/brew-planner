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
    // container-type: inline-size;
    // overflow: auto;
    // width: min-content;
    // min-width: 325px;
    // width: clamp(325px, 65vw, 85vw);
    // width: auto;
    // width: fit-content;
    @media screen and (max-width: 400px) {
      min-width: 90vw;
    }

    @media screen and (max-width: 600px) {
      width: clamp(325px, 65vw, 85vw);

    }

    @media screen and (max-width: 900px) {
      width: clamp(325px, 25vw, 65vw);
    }
    
  }
`;

const StyledContent = muiStyled(DialogContent)`
  padding-top: 1em !important;
  margin-top: 1em;
  max-width: 95cqi;
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
