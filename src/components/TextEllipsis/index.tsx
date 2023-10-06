import { useState } from "react";
import Tooltip from "@mui/material/Tooltip";

const TextEllipsis = ({
  value,
  maxLength = 10,
}: {
  value: string;
  maxLength?: number;
}) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const valueWithEllipsis =
    value.length > maxLength ? `${value.slice(0, 20)}...` : value;
  return (
    <Tooltip
      title={value}
      onOpen={() => setTooltipOpen(true)}
      onClose={() => setTooltipOpen(false)}
      open={tooltipOpen}
      onClick={() => setTooltipOpen(!tooltipOpen)}
    >
      <span>{valueWithEllipsis}</span>
    </Tooltip>
  );
};

export default TextEllipsis;
