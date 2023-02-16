import IconButton from "@mui/material/IconButton";
import Tooltip, {TooltipProps} from "@mui/material/Tooltip";
import Paper from "@mui/material/Paper";
import Popper, { PopperPlacementType } from "@mui/material/Popper";
import { useState, ReactElement, MouseEventHandler, MouseEvent } from "react";
import { ChildProps } from "../../types";

type TooltipPlacement = TooltipProps["placement"];

const CustomPopper = ({
  children,
  icon,
  placement,
  tooltip,
  buttonText
}: {
  children: ChildProps | string;
  icon?: ReactElement;
  placement: PopperPlacementType;
  tooltip?: string;
  buttonText?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const onClick: MouseEventHandler<HTMLElement> = (event: MouseEvent) => {
    setAnchorEl(event.currentTarget);
    setOpen(!open);
  };

  const oppositePlacement = {
    left: "right",
    right: "left",
    bottom: "top",
    top: "bottom",
    "top-start": "bottom-start",
    "top-end": "bottom-end",
    "left-start": "right-start",
    "left-end": "right-end",
    "right-start": "left-start",
    "right-end": "left-end",
    "bottom-start": "top-start",
    "bottom-end": "top-end"
  } as Record<string, TooltipPlacement>;
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
