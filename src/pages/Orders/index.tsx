import Page from "../../components/Page";
import OrdersTable from "./OrdersTable";
import withLoadingSpinner from "../../hoc/withLoadingSpinner";
import { useEffect, useState } from "react";
import useAPI from "../../hooks/useAPI";
import useAlert from "../../hooks/useAlert";
import { CustomerOrder } from "../../types";
import CustomTabs from "../../components/CustomTabs";
import { Badge, Typography } from "@mui/material";

const Orders = ({ doneLoading }: { doneLoading: () => void }) => {
  const [tableData, setTableData] = useState([] as CustomerOrder[]);
  const [salesChannels, setSalesChannels] = useState([]);
  const {
    isLoading: loading,
    data,
    error,
    refetch: refresh
  } = useAPI("orders");
  const { alertError } = useAlert();

  useEffect(() => {
    if (!loading) {
      if (data) {
        const salesChannels = Array.from(new Set(data.data.orders.map((order: CustomerOrder) => order.salesChannel.name)));
        setSalesChannels(salesChannels);
        setTableData(data.data.orders);
      }
      if (error) {
        alertError(error);
      }
      doneLoading();
    }
  }, [loading, data, error, alertError, doneLoading]);

  const filterBySalesChannel = (channelName: string) => {
    return (order: CustomerOrder) => {
      return order.salesChannel?.name === channelName;
    };
  };
  const createOrdersTab = (label: string, data: CustomerOrder[], filterFn: (row: any) => boolean) => {
    return {
      icon: (
        <Badge
          badgeContent={
            filterFn ? tableData.filter(filterFn).length : data.length
          }
          color="primary"
        >
          <Typography>{label}&nbsp;&nbsp;&nbsp;</Typography>
        </Badge>
      ),
      tabContent: <OrdersTable data={data} filterFn={filterFn} refresh={refresh} />
    };
  };

  const ordersTabs = salesChannels.map(channel => createOrdersTab(channel, tableData, filterBySalesChannel(channel)));
  const fulfillmentTabs = [
    {
      label: "Orders",
      tabContent: (
        <CustomTabs tabsGroupName="OrdersTabs" tabsList={ordersTabs} />
      )
    },
    {
      label: "Shipments",
      tabContent: (
        <CustomTabs tabsGroupName="ShipmentsTabs" tabsList={ordersTabs} />
      )
    },
    
  ];
  return (
    <Page>
      <CustomTabs tabsList={ordersTabs} tabsGroupName="FulfillmentTabs" />
    </Page>
  );
};

export default withLoadingSpinner(Orders);
