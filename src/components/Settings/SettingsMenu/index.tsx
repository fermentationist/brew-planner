import { MouseEventHandler, ReactNode, useState, memo } from "react";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import DarkMode from "@mui/icons-material/DarkMode";
import LightMode from "@mui/icons-material/LightMode";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import BrewerySelector from "../../BrewerySelector";
import { useNavigate } from "react-router-dom";
import useGlobalState from "../../../hooks/useGlobalState";
import useAuth from "../../../hooks/useAuth";
import useAPI from "../../../hooks/useAPI";

interface SettingsMenuItem {
  title?: string;
  link?: string | MouseEventHandler;
  divider?: boolean;
  icon?: ReactNode;
  child?: JSX.Element;
  tooltip?: string;
}

const SettingsMenu = ({ closeDrawer }: { closeDrawer: () => void }) => {
  console.log("SettingsMenu loaded")
  const [brewerySelectorIsLoading, setBrewerySelectorIsLoading] = useState(false);
  const { auth, logout, changeBrewery } = useAuth();
  const [globalState, dispatch] = useGlobalState();
  const { 
    resetAPI, 
    // refetch: refreshBreweries 
  } = useAPI("breweries");

  const navigate = useNavigate();

  const callLogout = async () => {
    console.log("logging out...");
    logout();
    resetAPI();
    closeDrawer();
    navigate("/login");
  };

  const toggleDarkMode = () => {
    dispatch({
      type: "TOGGLE_THEME"
    })
    // setGlobalState(prevState => {
    //   return {
    //     ...prevState,
    //     theme: globalState.theme === "dark" ? "light" : "dark"
    //   }
    // });
  };

  const toggleSafeMode = () => {
    dispatch({type: "TOGGLE_SAFE_MODE"});
    // setGlobalState(prevState => {
    //   return {
    //     ...prevState,
    //     safeMode: !globalState.safeMode
    //   }
    // });
  };

  const callChangeBrewery = async (breweryUuid: string) => {
    setBrewerySelectorIsLoading(true);
    changeBrewery(breweryUuid);
    setBrewerySelectorIsLoading(false);
    // refreshBreweries();
    closeDrawer();
  };

  // MENU ITEMS
  const menuItems: SettingsMenuItem[] = [
    {
      icon: <ChevronRightIcon />,
      link: closeDrawer,
      tooltip: "close"
    },
    {
      link: toggleDarkMode,
      icon: globalState.theme === "dark" ? <LightMode /> : <DarkMode />,
      tooltip: globalState.theme === "dark" ? "Light mode" : "Dark mode",
      divider: true
    },
    {
      title: auth?.user
        ? `Log out ${auth.user.displayName || auth.user.email}`
        : "Log in",
      link: auth?.user ? callLogout : "/login"
    },
    {
      divider: true
    },
    {
      child: (
        <FormControlLabel
          control={
            <Switch
              checked={!!globalState.safeMode}
              onChange={toggleSafeMode}
              size="small"
            />
          }
          label="Safe Mode"
          sx={{ margin: "0em" }}
          labelPlacement="start"
        />
      )
    }
  ];

  if (auth?.user) {
    const brewerySelection = {
      child: (
        <BrewerySelector
          onSubmit={callChangeBrewery}
          loading={brewerySelectorIsLoading}
          auth={auth}
        />
      )
    };
    // add brewery selector to menuItems
    menuItems.splice(2, 0, brewerySelection);
  }

  return (
    <>
      <List>
        {menuItems.map((item, index) => {
          return (
            <div key={index}>
              {item.child ? (
                <ListItemButton>{item.child}</ListItemButton>
              ) : (
                <>
                  {item.title || item.link ? (
                    <ListItemButton
                      onClick={
                        typeof item.link === "function" ? item.link : null
                      }
                      href={typeof item.link === "string" ? item.link : null}
                    >
                      {item.icon ? (
                        <Tooltip title={item.tooltip}>
                          <ListItemIcon>{item.icon}</ListItemIcon>
                        </Tooltip>
                      ) : null}
                      <ListItemText primary={item.title || ""} />
                    </ListItemButton>
                  ) : null}
                </>
              )}
              {item.divider ? <Divider /> : null}
            </div>
          );
        })}
      </List>
    </>
  );
};

export default memo(SettingsMenu, () => true);
