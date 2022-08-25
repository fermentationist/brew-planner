import {useState} from "react";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import SettingsIcon from "@mui/icons-material/Settings";
import SettingsMenu from "./SettingsMenu";
import {styled as muiStyled} from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";

const SettingsButton = muiStyled(IconButton)`
  margin: 1em;
`;

const Settings = () => {
  const [showDrawer, setShowDrawer] = useState(false);
  const closeDrawer = () => setShowDrawer(false);
  return (
    <>
      <Tooltip title="Settings">
        <SettingsButton size="large" onClick={() => setShowDrawer(!showDrawer)}>
          <SettingsIcon />
        </SettingsButton>
      </Tooltip>
      {
        showDrawer ? (
          <Drawer
            anchor="right"
            open={showDrawer}
            onClose={closeDrawer}
          >
            <SettingsMenu closeDrawer={closeDrawer} />
          </Drawer>
        ) : null
      }
    </>
  );
}

export default Settings;
