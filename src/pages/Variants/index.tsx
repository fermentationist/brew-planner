import { useState, useEffect, useRef } from "react";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import InventoryIcon from "@mui/icons-material/Inventory";
import AddIcon from "@mui/icons-material/AddCircle";
import RefreshIcon from "@mui/icons-material/Refresh";
import Chip from "@mui/material/Chip";
import DataTable, { getRowData } from "../../components/DataTable";
import VariantModal from "./VariantModal";
import withLoadingSpinner from "../../hoc/withLoadingSpinner";
import useAPI, { APIRequest } from "../../hooks/useAPI";
import useAlert from "../../hooks/useAlert";
import useConfirm from "../../hooks/useConfirm";
import Page from "../../components/Page";
import CSVImport from "../../components/CSVImport";
import { ProductVariant } from "../../types";
import { useLocation, useNavigate } from "react-router-dom";
import { parseQueryString } from "../../utils/helpers";

export interface VariantFormData {
  sku: string;
  fullname: string;
  variantName: string;
  brandName: string;
  productName: string;
  addedAt: number;
  upc?: string;
  dimensions: {
    length?: number;
    width?: number;
    height?: number;
    weight?: number;
  };
}

type ModeValue = "create" | "edit";

const Variants = ({
  startLoading,
  doneLoading
}: {
  startLoading: () => void;
  doneLoading: () => void;
}) => {
  const [tableData, setTableData] = useState([]);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [mode, setMode] = useState("create" as ModeValue);
  const [variantData, setVariantData] = useState(null);
  const [skuChip, setSKUChip] = useState(null);
  const [refreshValue, setRefreshValue] = useState(0);
  const {
    isLoading: loading,
    data,
    error,
    refetch: refresh
  } = useAPI("variants");
  const { alertError, alertErrorProm, callAlert } = useAlert();
  const { confirmDelete, confirm } = useConfirm();
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading) {
      if (data) {
        let variants = data.data.variants;
        const [sku] = parseQueryString(["sku"], location.search);
        if (sku) {
          variants = variants.filter(
            (variant: ProductVariant) => variant.sku === sku
          );
          setSKUChip(sku);
        }
        const sorted = variants.sort(
          (a: ProductVariant, b: ProductVariant) => b.addedAt - a.addedAt
        );
        setTableData(sorted);
      }
      if (error) {
        alertError(error);
      }
      doneLoading();
    }
  }, [loading, data, error, alertError, doneLoading, refreshValue]);

  const editVariant = (rowData: ProductVariant) => {
    setMode("edit");
    setVariantData(rowData);
    setShowVariantModal(true);
  };
  const addVariant = () => {
    setMode("create");
    setVariantData(null);
    setShowVariantModal(true);
  };
  const onVariantModalSubmit = async (formData: VariantFormData) => {
    if (!formData.brandName) {
      return callAlert("Please select or enter a brand name");
    }
    if (!formData.productName) {
      return callAlert("Please select or enter a product name");
    }
    const reqData = {
      ...formData,
      ...formData.dimensions
    };
    delete reqData.dimensions;
    const variantRequest = new APIRequest({
      url: `/variants/${mode === "edit" ? variantData?.sku : ""}`,
      method: mode === "edit" ? "patch" : "post",
      data: reqData
    });

    await variantRequest.request().catch(alertErrorProm);
    refresh();
    setShowVariantModal(false);
  };

  const deleteSingleVariant = (sku: string) => {
    const deleteVariant = new APIRequest({
      url: `/variants/${sku}`,
      method: "delete"
    });
    return deleteVariant.request().catch(alertErrorProm);
  };

  const deleteRows = async (rowsToDelete: any) => {
    const skusToDelete = rowsToDelete.data.map(
      (row: { index: number; dataIndex: number }) => {
        return tableData[row.dataIndex].sku;
      }
    );
    const qty = skusToDelete.length;
    const confirm = await confirmDelete(qty, "variant");
    if (!confirm) {
      return;
    }
    if (qty > 1) {
      startLoading();
    }
    if (qty > 4) {
      callAlert("Please be patient, this may take a little while...");
    }
    for (const sku of skusToDelete) {
      console.log("attempting to delete user:", sku);
      await deleteSingleVariant(sku);
    }
    refresh();
    doneLoading();
  };

  const updateTableWithImportedData = async (importedData: any[]) => {
    const length = importedData.length;
    const ok = await confirm(
      `Are you sure you want to add/update ${
        length > 1 ? "these" : "this"
      } ${length} variant${length > 1 ? "s" : ""}?`
    );
    if (!ok) {
      return callAlert("Operation cancelled");
    }
    const dataWithParsedNumbers = importedData.map(row => {
      const rowCopy = {...row};
      rowCopy.length = rowCopy.length && parseFloat(rowCopy.length);
      rowCopy.width = rowCopy.width && parseFloat(rowCopy.width);
      rowCopy.height = rowCopy.height && parseFloat(rowCopy.height);
      rowCopy.weight = rowCopy.weight && parseFloat(rowCopy.weight);
      return rowCopy
    })
    const bulkUpdateVariants = new APIRequest({
      url: "/variants/bulk",
      method: "patch",
      data: { variants: dataWithParsedNumbers } 
    });

    bulkUpdateVariants.request().then(() => {
      callAlert("Upload successful");
      refresh();
    }).catch(alertErrorProm);
  };

  const clearSKUFilter = () => {
    setSKUChip(null);
    navigate("/variants");
    setRefreshValue(Math.random());
  };

  const viewInventory = (rowData: ProductVariant) => {
    navigate(`/inventory/details?sku=${rowData.sku}`);
  };

  const options = {
    sortThirdClickReset: true
  };
  const columns = [
    {
      label: "SKU",
      name: "sku",
      options
    },
    {
      label: "UPC",
      name: "upc",
      options
    },
    {
      label: "Full name",
      name: "fullname",
      options
    },
    {
      label: "Variant name",
      name: "variantName",
      options
    },
    {
      label: "Brand",
      name: "brandName",
      options
    },
    {
      label: "Product name",
      name: "productName",
      options
    },
    {
      label: "Length",
      name: "length",
      options: {
        searchable: false,
        display: false,
        ...options
      }
    },
    {
      label: "Width",
      name: "width",
      options: {
        searchable: false,
        display: false,
        ...options
      }
    },
    {
      label: "Height",
      name: "height",
      options: {
        searchable: false,
        display: false,
        ...options
      }
    },
    {
      label: "Weight",
      name: "weight",
      options: {
        searchable: false,
        display: false,
        ...options
      }
    },
    {
      label: "",
      name: "",
      options: {
        customBodyRender: (value: any, meta: any) => {
          return (
            <Tooltip title="view inventory">
              <IconButton
                onClick={viewInventory.bind(null, getRowData(meta.rowData))}
              >
                <InventoryIcon />
              </IconButton>
            </Tooltip>
          );
        },
        sort: false,
        searchable: false,
        download: false,
        ...options
      }
    },
    {
      label: "",
      name: "",
      options: {
        customBodyRender: (value: any, meta: any) => {
          return (
            <Tooltip title="edit variant">
              <IconButton
                onClick={editVariant.bind(null, getRowData(meta.rowData))}
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
      <Tooltip title="Create variant">
        <IconButton onClick={addVariant}>
          <AddIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Refresh">
        <IconButton onClick={refresh}>
          <RefreshIcon />
        </IconButton>
      </Tooltip>
      <CSVImport
        requiredKeys={["sku"]}
        onUpdate={updateTableWithImportedData}
        allowedKeys={{
          SKU: "sku",
          "Full name": "fullname",
          "Variant name": "variantName",
          Brand: "brandName",
          "Product name": "productName",
          Length: "length", 
          Width: "width", 
          Height: "height",
          Weight: "weight"
        }}
      />
      {skuChip ? (
        <Chip label={`SKU = ${skuChip}`} onDelete={clearSKUFilter} />
      ) : null}
      <DataTable
        data={tableData}
        columns={columns}
        options={{ selectableRows: "multiple", onRowsDelete: deleteRows }}
      />
      {showVariantModal ? (
        <VariantModal
          showModal={showVariantModal}
          closeModal={() => setShowVariantModal(false)}
          data={variantData}
          mode={mode}
          onSubmit={onVariantModalSubmit}
        />
      ) : null}
    </Page>
  );
};

export default withLoadingSpinner(Variants);
