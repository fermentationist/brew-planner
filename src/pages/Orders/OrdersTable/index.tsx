import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InventoryIcon from "@mui/icons-material/InventoryOutlined";
import DataTable, {getRowData} from "../../../components/DataTable";
import { CustomerOrder } from "../../../types";

const OrdersTable = ({
  data,
  columns,
  filterFn = x => true,
  refresh
}: {
  data: CustomerOrder[];
  columns?: any[];
  filterFn: (row: any) => boolean;
  refresh: () => void;
}) => {
  const processOrder = rowData => {
    console.log("rowData in processOrder:", rowData);
  }
  const options = {
    sortThirdClickReset: true
  };
  const defaultColumns = [
    {
      label: "Order ID (full)",
      name: "orderId",
      options: {
        display: false,
        ...options
      }
    },
    {
      label: "Order ID",
      name: "orderId",
      options: {
        customBodyRender: (value: string) => value.slice(0, 8),
        ...options
      }
    },
    {
      label: "Sales channel",
      name: "salesChannel.name",
      options: {
        display: false,
        ...options
      }
    },
    {
      label: "Sales channel ID",
      name: "salesChannel.salesChannelId",
      options: {
        display: false,
        ...options
      }
    },
    {
      label: "Email",
      name: "email",
      options: {
        display: false,
        ...options
      }
    },
    {
      label: "Subtotal",
      name: "subtotal",
      options: {
        customBodyRender: (value: number) => value.toFixed(2),
        ...options
      }
    },
    {
      label: "Tax",
      name: "tax",
      options: {
        customBodyRender: (value: number) => value.toFixed(2),
        ...options
      }
    },
    {
      label: "Shipping fee",
      name: "shippingFee",
      options: {
        customBodyRender: (value: number) => value.toFixed(2),
        ...options
      }
    },
    {
      label: "Total",
      name: "total",
      options: {
        customBodyRender: (value: number) => value.toFixed(2),
        ...options
      }
    },
    {
      label: "",
      name: "",
      options: {
        customBodyRender: (value: any, meta: any) => {
          return (
            <Tooltip title="process order">
              <IconButton
                onClick={processOrder.bind(null, getRowData(meta.rowData))}
              >
                <InventoryIcon />
              </IconButton>
            </Tooltip>
          );
        },
        sort: false,
        searchable: false,
        ...options
      }
    },
  ];
  return (
    <DataTable
      data={data.filter(filterFn)}
      columns={columns || defaultColumns}
      refresh={refresh}
    />
  );
};

export default OrdersTable;
