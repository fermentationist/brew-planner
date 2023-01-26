import { ChangeEvent, ReactNode, useState, ReactElement } from "react";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import storage from "../../utils/storage";
import { Typography } from "@mui/material";
import styled from "styled-components";

export interface TabsData {
  label?: string;
  tabContent?: ReactNode;
  icon?: ReactElement;
}

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  currentTab: number;
}

const TabPanelDiv = styled.div`
  width: 100vw;
`;

const TabPanel = (props: TabPanelProps) => {
  const { children, index, currentTab, ...other } = props;

  return (
    <TabPanelDiv role="tabpanel" hidden={currentTab !== index} {...other}>
      {currentTab === index ? children : null}
    </TabPanelDiv>
  );
};

const CustomTabs = ({
  tabsList,
  tabsGroupName = "Tabs group " + Math.floor(Math.random() * 10000)
}: {
  tabsList: TabsData[];
  tabsGroupName?: string;
}) => {
  const { getStorage, setStorage } = storage("brewPlanner");
  const lastTab = getStorage(`${tabsGroupName}.currentTab`);
  const [currentTab, setCurrentTab] = useState(lastTab || 0);
  const onTabChange = (event: ChangeEvent, tabNumber: number) => {
    setCurrentTab(tabNumber);
    setStorage(`${tabsGroupName}.currentTab`, tabNumber);
  };
  return (
    <>
      <Tabs
        value={currentTab}
        onChange={onTabChange}
        variant="scrollable"
        allowScrollButtonsMobile={true}
        sx={{ maxWidth: "100vw" }}
      >
        {tabsList.map((tabData, index) => {
          return (
            <Tab
              value={index}
              key={index}
              icon={tabData.icon || <Typography>{tabData.label}</Typography>}
            />
          );
        })}
      </Tabs>
      {tabsList.map((tabData, index) => {
        return (
          <TabPanel currentTab={currentTab} index={index} key={index}>
            {tabData.tabContent}
          </TabPanel>
        );
      })}
    </>
  );
};

export default CustomTabs;
