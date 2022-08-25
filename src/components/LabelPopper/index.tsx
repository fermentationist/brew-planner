import CustomPopper from "../CustomPopper";
import LabelIcon from "@mui/icons-material/StickyNote2";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import {showPDFLabels, showPNGLabels} from "../../utils/shippingUtils";

const LabelPopper = ({labelData, labelFileType}) => {
  const labels = labelData && JSON.parse(labelData);
  if (labelFileType === "pdf") {
    return (
      <CustomPopper icon={<LabelIcon />} placement="bottom" tooltip="view labels">
        <List>
          {
            labels.map((label, index) => {
              return (
                <ListItem key={index} onClick={showPDFLabels.bind(null, label)}>
                  Label {index + 1}
                </ListItem>
              )
            })
          }
        </List>
      </CustomPopper>
    );
  }

  return (
    <Tooltip title="view labels">
      <IconButton
        onClick={showPNGLabels.bind(null, labels)}
      >
        <LabelIcon />
      </IconButton>
    </Tooltip>
  );
}

export default LabelPopper;
