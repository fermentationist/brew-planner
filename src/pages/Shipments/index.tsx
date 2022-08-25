import Page from "../../components/Page";
import ShipmentsTable from "./ShipmentsTable";
import withLoadingSpinner from "../../hoc/withLoadingSpinner";
import { useEffect, useState } from "react";
import useAPI from "../../hooks/useAPI";
import useAlert from "../../hooks/useAlert";
import { CustomerOrder } from "../../types";
import { columnOptions } from "../../components/DataTable";
import CustomTabs from "../../components/CustomTabs";
import { Badge, Typography } from "@mui/material";
const { options, dateOptions, booleanOptions, moneyOptions } = columnOptions;
const Orders = ({ doneLoading }: { doneLoading: () => void }) => {
  const [tableData, setTableData] = useState([] as CustomerOrder[]);
  const [salesChannels, setSalesChannels] = useState([]);
  const {
    isLoading: loading,
    data,
    error,
    refetch: refresh
  } = useAPI("shipments");
  const { alertError } = useAlert();

  useEffect(() => {
    if (!loading) {
      if (data) {
        setTableData(data.data.shipments);
      }
      if (error) {
        alertError(error);
      }
      doneLoading();
    }
  }, [loading, data, error, alertError, doneLoading]);

  const createShipmentsTab = (label: string, data, filterFn?: (row: any) => boolean, columns?: any[]) => {
    const filteredData = filterFn ? data.filter(filterFn) : data;
    return {
      icon: (
        <Badge
          badgeContent={filteredData.length}
          color="primary"
        >
          <Typography>{label[0].toUpperCase() + label.slice(1)}&nbsp;&nbsp;&nbsp;</Typography>
        </Badge>
      ),
      tabContent: <ShipmentsTable data={filteredData} refresh={refresh} columns={columns} />
    };
  };

  const filterByStatus = status => row => row.shipment.status === status;

  const pendingColumns = [
    {
      label: "Order ID",
      name: "order.orderId",
      options
    },
    {
      label: "External ID",
      name: "order.externalId",
      options: {
        display: false,
        ...options
      }
    },
    {
      label: "Shipment ID",
      name: "shipment.shipmentId",
      options
    },
    {
      label: "Email",
      name: "order.email",
      options
    },
    {
      label: "Last name",
      name: "order.billToLast",
      options
    },
    {
      label: "First name",
      name: "order.billToFirst",
      options
    },
    {
      label: "Order placed at",
      name: "order.placedAt",
      options: dateOptions
    },
    {
      label: "Shipment created at",
      name: "shipment.createdAt",
      options: {
        display: false,
        ...dateOptions
      }
    },
    {
      label: "Accepted at",
      name: "shipment.acceptedAt",
      options: {
        display: false,
        ...dateOptions
      }
    },
    {
      label: "Rejected at",
      name: "shipment.rejectedAt",
      options: {
        display: false,
        ...dateOptions
      }
    },
    {
      label: "Accepted",
      name: "shipment.isAccepted",
      options: {
        display: false,
        ...booleanOptions
      }
    },
    {
      label: "Subtotal",
      name: "order.subtotal",
      options: {
        display: false,
        ...moneyOptions
      }
    },
    {
      label: "Tax",
      name: "order.tax",
      options: {
        display: false,
        ...moneyOptions
      }
    },
    {
      label: "Shipping fee",
      name: "order.shippingFee",
      options: {
        display: false,
        ...moneyOptions
      }
    },
    {
      label: "Total",
      name: "order.total",
      options: moneyOptions
    },

  ];
  const acceptedColumns = [...pendingColumns];
  const tabData = [
    {status: "pending", columns: pendingColumns}, 
    {status: "accepted", columns: acceptedColumns}, 
    {status: "picked"}, 
    {status: "packed"}, 
    {status: "shipped"}, 
    {status: "delivered"}, 
    {status: "cancelled"},
    {status: "rejected", columns: pendingColumns }
  ]
  const shipmentsTabs = [
    createShipmentsTab("All", tableData),
    ...tabData.map(tab => createShipmentsTab(tab.status, tableData, filterByStatus(tab.status), tab.columns))
  ]

  return (
    <Page>
      <CustomTabs tabsList={shipmentsTabs} tabsGroupName="ShipmentsTabs" />
    </Page>
  );
};

export default withLoadingSpinner(Orders);
