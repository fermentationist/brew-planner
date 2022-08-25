import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";
import Popper, { PopperPlacementType } from "@mui/material/Popper";
import { useState, ReactElement } from "react";
import { ChildProps } from "../../types";

const CustomPopper = ({
  children,
  icon,
  placement,
  tooltip,
  buttonText
}: {
  children: ChildProps;
  icon?: ReactElement;
  placement: PopperPlacementType;
  tooltip?: string;
  buttonText?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const onClick = event => {
    setAnchorEl(event.currentTarget);
    setOpen(!open);
  };
  const oppositePlacement = {
    top: "bottom",
    left: "right",
    right: "left",
    bottom: "top",
    "top-start": "bottom-start",
    "top-end": "bottom-end",
    "left-start": "right-start",
    "left-end": "right-end",
    "right-start": "left-start",
    "right-end": "left-end",
    "bottom-start": "top-start",
    "bottom-end": "top-end"
  };
  return (
    <>
      <Tooltip title={tooltip} placement={oppositePlacement[placement]}>
        {icon ? (
          <IconButton onClick={onClick}>{icon}</IconButton>
        ) : (
          <span onClick={onClick}>{buttonText}</span>
        )}
      </Tooltip>
      <Popper open={open} anchorEl={anchorEl} placement={placement}>
        <Paper onClick={() => setOpen(false)}>{children}</Paper>
      </Popper>
    </>
  );
};

export default CustomPopper;
