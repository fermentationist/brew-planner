import { useEffect, useState } from "react";
import Page from "../../components/Page";
import DataTable, { getRowData } from "../../components/DataTable";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/AddCircle";
import RefreshIcon from "@mui/icons-material/Refresh";
import withLoadingSpinner from "../../hoc/withLoadingSpinner";
import useAPI, { APIRequest } from "../../hooks/useAPI";
import useAlert from "../../hooks/useAlert";
import Tooltip from "@mui/material/Tooltip";
import { useNavigate, Link } from "react-router-dom";
import InventoryAddModal from "./InventoryAddModal";
import CSVImport from "../../components/CSVImport";
import { InventoryEntry, ProductVariant } from "../../types";

interface AddInventoryFormData {
  variant: ProductVariant;
  price?: number;
  quantity?: number;
}

const Inventory = function ({
  doneLoading,
  startLoading
}: {
  doneLoading: () => void;
  startLoading: () => void;
}) {
  const [tableData, setTableData] = useState([]);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const {
    isLoading: loading,
    data,
    error,
    refetch: refresh,
    BREWERY_ROUTE
  } = useAPI("inventory");
  const { callAlert, alertError, alertErrorProm } = useAlert();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading) {
      if (data) {
        const sorted = data.data.inventory.sort(
          (a: InventoryEntry, b: InventoryEntry) =>
            b.inventory.addedAt - a.inventory.addedAt
        );
        setTableData(sorted);
      }
      if (error) {
        alertError(error);
      }
      doneLoading();
    }
  }, [data, error, loading, startLoading, doneLoading, callAlert]);

  const viewInventoryVariant = (rowData: any) => {
    const inventoryId = rowData.inventory.inventoryId;
    navigate(`/inventory/details?inventoryId=${inventoryId}`);
    // window.open(`/inventory/details?inventoryId=${inventoryId}`, "_blank")
  };

  const createInventory = async (formData: AddInventoryFormData) => {
    if (!formData.variant) {
      return callAlert("Please select a variant");
    }
    const reqData = {
      sku: formData.variant.sku,
      quantity: formData.quantity || 0,
      price: formData.price || null
    };
    const postInventory = new APIRequest({
      baseURL: BREWERY_ROUTE,
      url: "/inventory",
      method: "post",
      data: reqData
    });
    await postInventory.request().catch(alertError);
    refresh();
    setShowInventoryModal(false);
  };

  const updateTableWithImportedData = async importedData => {
    console.log("importedData:", importedData);
    const importedDataWithParsedNumbers = importedData.map(row => {
      row.price = row.price && parseFloat(row.price);
      row.available = row.available && parseInt(row.available);
      return row;
    });
    const bulkInventoryImport = new APIRequest({
      baseURL: BREWERY_ROUTE,
      url: "/inventory/bulk",
      method: "patch",
      data: {inventory: importedDataWithParsedNumbers}
    });
    const response = await bulkInventoryImport.request().catch(async error => {
      await alertErrorProm(error);
    });
    if (response) {
      callAlert("Inventory import successful");
      refresh();
    }
  }

  const options = {
    sortThirdClickReset: true
  };
  const columns = [
    {
      label: "Inventory ID",
      name: "inventory.inventoryId",
      options: {
        display: false
      }
    },
    {
      label: "Date added",
      name: "inventory.addedAt",
      options: {
        customBodyRender: (value: number) => {
          return new Date(value).toString();
        },
        display: false,
        ...options
      }
    },
    {
      label: "SKU",
      name: "variant.sku",
      options
    },
    {
      label: "Brand",
      name: "variant.brandName",
      options
    },
    {
      label: "Name",
      name: "variant.fullname",
      options: {
        customBodyRender: (value: string, meta: any) => {
          const rowData = getRowData(meta.rowData);
          return (
            <Link to={`/variants?sku=${rowData.variant.sku}`}>{value}</Link>
          );
        },
        ...options
      }
    },
    {
      label: "Variant",
      name: "variant.variantName",
      options
    },
    {
      label: "Available",
      name: "inventory.available",
      options
    },
    {
      label: "Allocated",
      name: "inventory.allocated",
      options
    },
    {
      label: "Price",
      name: "inventory.price",
      options: {
        customBodyRender: (value: number) => {
          return typeof value === "string"
            ? "$" + value
            : value
            ? "$" + value.toFixed(2)
            : value;
        }
      }
    },
    {
      label: "UPC",
      name: "variant.upc",
      options
    },
    {
      label: "",
      name: "",
      options: {
        customBodyRender: (value: any, meta: any) => {
          return (
            <Tooltip title="edit inventory">
              <IconButton
                onClick={viewInventoryVariant.bind(
                  null,
                  getRowData(meta.rowData)
                )}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          );
        },
        sort: false,
        searchable: false,
        download: false,
        ...options
      }
    }
  ];

  return (
    <Page>
      <Tooltip title="Add variant to inventory">
        <IconButton onClick={() => setShowInventoryModal(true)}>
          <AddIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Refresh">
        <IconButton onClick={refresh}>
          <RefreshIcon />
        </IconButton>
      </Tooltip>
      <CSVImport
        requiredKeys={[["inventoryId", "sku"]]}
        onUpdate={updateTableWithImportedData}
        allowedKeys={{
          "Inventory ID": "inventoryId",
          SKU: "sku",
          Available: "available",
          Quantity: "available",
          quantity: "available",
          Price: "price"
        }}
        message="Please Note: This csv import can add new variants to inventory, setting price and quantity available. It can also be used to update prices for existing inventory. It CANNOT be used to update quantity available for existing inventory."
      />
      <DataTable data={tableData} columns={columns} />
      {showInventoryModal ? (
        <InventoryAddModal
          showModal={showInventoryModal}
          closeModal={() => setShowInventoryModal(false)}
          data={tableData}
          onSubmit={createInventory}
        />
      ) : null}
    </Page>
  );
};

export default withLoadingSpinner(Inventory);
