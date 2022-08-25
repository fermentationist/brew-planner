import { useState, useEffect } from "react";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import NotesIcon from "@mui/icons-material/Notes";
import DataTable from "../../../components/DataTable";
import useAPI, { APIRequest } from "../../../hooks/useAPI";
import useAlert from "../../../hooks/useAlert";

export interface InventoryChange {
  sku: string;
  qtyDiff: number;
  changedAt: number;
  reason?: string;
  note?: string;
}

const InventoryChangesTable = ({
  sku,
  refreshValue
}: {
  sku?: string;
  refreshValue: number;
}) => {
  const [tableData, setTableData] = useState([]);
  const { alertError, callAlert } = useAlert();
  const { BREWERY_ROUTE } = useAPI();
  useEffect(() => {
    const getInventoryChanges = new APIRequest({
      baseURL: BREWERY_ROUTE,
      method: "get"
    });
    if (sku) {
      console.log("displaying changes for sku:", sku);
      getInventoryChanges
        .request({ url: `/inventoryChange?sku=${sku}` })
        .then(response => {
          const sorted = response.data.inventoryChanges.sort(
            (a: InventoryChange, b: InventoryChange) =>
              b.changedAt - a.changedAt
          );
          setTableData(sorted);
        })
        .catch(alertError);
    } else {
      console.log("displaying all changes");
      getInventoryChanges
        .request({ url: "/inventoryChange" })
        .then(response => {
          const sorted = response?.data.inventoryChanges.sort(
            (a: InventoryChange, b: InventoryChange) =>
              b.changedAt - a.changedAt
          );
          setTableData(sorted);
        })
        .catch(alertError);
    }
    return () => getInventoryChanges.abort();
  }, [sku, alertError, refreshValue]);

  const showNote = (note: string) => {
    callAlert({ message: note, title: "Inventory change note" });
  };
  const columns = [
    {
      label: "Qty diff",
      name: "qtyDiff",
      options: {
        customBodyRender: (value: number) => {
          const color = value > 0 ? "green" : "red";
          return <span style={{ color }}>{value}</span>;
        },
        sortThirdClickReset: true
      }
    },
    {
      label: "Reason",
      name: "reason",
      options: {
        sortThirdClickReset: true
      }
    },
    {
      label: "Date",
      name: "changedAt",
      options: {
        customBodyRender: (value: number) => {
          return new Date(value).toString();
        },
        sortThirdClickReset: true
      }
    },
    {
      label: "",
      name: "note",
      options: {
        customBodyRender: (value: string) => {
          if (!value) {
            return null;
          }
          return (
            <Tooltip title="view note">
              <IconButton onClick={showNote.bind(null, value)}>
                <NotesIcon />
              </IconButton>
            </Tooltip>
          );
        },
        sortThirdClickReset: true
      }
    }
  ];
  if (!sku) {
    columns.unshift({
      label: "SKU",
      name: "sku",
      options: {
        sortThirdClickReset: true
      }
    });
  }
  return (
    <DataTable
      columns={columns}
      data={tableData}
      title="Inventory changes"
      options={{
        download: false,
        viewColumns: false
      }}
    />
  );
};

export default InventoryChangesTable;
