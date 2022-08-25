import { useEffect, useState } from "react";
import Page from "../../components/Page";
import EditInventoryModal from "./EditInventoryModal";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import Divider from "@mui/material/Divider";
import InventoryChangesTable from "./InventoryChangesTable";
import { useLocation } from "react-router-dom";
import { parseQueryString } from "../../utils/helpers";
import useAPI, { APIRequest } from "../../hooks/useAPI";
import useAlert from "../../hooks/useAlert";
import { APIError, InventoryEntry } from "../../types";
import withLoadingSpinner from "../../hoc/withLoadingSpinner";
import SimpleTable from "../../components/SimpleTable";
import { styled as muiStyled } from "@mui/material/styles";
import styled from "styled-components";
import {useNavigate, Link} from "react-router-dom";

const Table = muiStyled(SimpleTable)`
  width: 75vw;
  @media screen and (max-width: 600px) {
    width: 100vw;
  }
`;

const Heading = styled.h1`
  font-weight: 500 !important;
  font-size: 1.25rem !important;
  margin: 1em !important;
`;

const Subheading = styled.h2`
  font-weight: 500 !important;
  font-size: 1rem !important;
  margin: 1em !important;
`;

const InventoryDetails = ({
  doneLoading
}: {
  doneLoading: () => void;
}) => {
  const [inventoryData, setInventoryData] = useState(null);
  const [showEditInventoryModal, setShowEditInventoryModal] = useState(false);
  const [inventoryChangesRefreshValue, setInventoryChangesRefreshValue] = useState(0);
  const location = useLocation();
  const { callAlert, alertError, alertErrorProm } = useAlert();
  const {
    isLoading: loading,
    data,
    error,
    refetch: refresh,
    BREWERY_ROUTE
  } = useAPI("inventory");  
  const navigate =  useNavigate();

  useEffect(() => {
    const [inventoryId, sku] = parseQueryString(
      ["inventoryId", "sku"],
      location.search
    );
    if (!loading) {
      if (data) {
        const [result] = data.data.inventory.filter((entry: InventoryEntry) => {
          return inventoryId
            ? entry.inventory.inventoryId === inventoryId
            : entry.variant.sku === sku;
        });
        if (!result) {
          callAlert("This variant has not been inserted into inventory yet. Navigating to Inventory table. New variants may be added to inventory there.");
          navigate("/inventory", {replace: true});
        }
        const price = result?.inventory?.price;
        result.inventory.price =
          typeof price === "number" ? price.toFixed(2) : price;
        setInventoryData(result);
      }
      if (error) {
        alertError(error);
      }
      doneLoading();
    }
  }, [location.search, doneLoading, loading, data, error, callAlert]);

  const updateInventory = async (formData: any) => {
    if (
      formData?.price === inventoryData?.inventory?.price &&
      formData?.inventoryChange?.diff === 0
    ) {
      // if nothing changed
      return; // do nothing
    }
    if (formData?.price !== inventoryData?.inventory?.price) {
      const patchInventory = new APIRequest({
        baseURL: BREWERY_ROUTE,
        url: `inventory/${inventoryData?.inventory?.inventoryId}`,
        method: "patch",
        data: { price: formData.price }
      });
      await patchInventory
        .request()
        .catch(alertErrorProm);
    }
    if (formData?.inventoryChange?.diff && formData.inventoryChange.diff !== 0) {
      if (!formData.inventoryChange.reason) {
        return callAlert("Please select a reason for the inventory change");
      }
      const reqData = {
        sku: inventoryData.variant.sku,
        qtyDiff: formData.inventoryChange.diff,
        reason: formData.inventoryChange.reason,
        note: formData.inventoryChange.note
      };
      const postInventoryChange = new APIRequest({
        baseURL: BREWERY_ROUTE,
        url: "/inventoryChange",
        method: "post",
        data: reqData
      });
      await postInventoryChange
        .request()
        .catch(alertErrorProm);
    }
    refresh();
    setInventoryChangesRefreshValue(Math.random());
    setShowEditInventoryModal(false);
  };
  
  const inventoryDataColumns = [
    {
      label: "Available",
      name: "inventory.available"
    },
    {
      label: "Allocated",
      name: "inventory.allocated"
    },
    {
      label: "Price",
      name: "inventory.price"
    },
    {
      label: "",
      name: "",
      options: {
        customBodyRender: () => {
          return (
            <Tooltip title="edit inventory">
              <IconButton onClick={() => setShowEditInventoryModal(true)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          );
        }
      }
    }
  ];

  return (
    <Page>
      <Heading>
        <Link to={`/variants?sku=${inventoryData?.variant?.sku}`}>
          {inventoryData?.variant?.fullname}
        </Link>
      </Heading>
      <Subheading>
        Brand: {inventoryData?.variant?.brandName}
        <br />
        Product: {inventoryData?.variant?.productName}
        <br />
        Variant: {inventoryData?.variant?.variantName}
        <br />
        SKU: {inventoryData?.variant?.sku}
      </Subheading>
      <Table columns={inventoryDataColumns} data={inventoryData ? [inventoryData] : []}/>
      <br />
      <Divider />
      <br />
      <InventoryChangesTable sku={inventoryData?.variant?.sku} refreshValue={inventoryChangesRefreshValue}/>
      {showEditInventoryModal ? (
        <EditInventoryModal
          showModal={showEditInventoryModal}
          data={inventoryData}
          closeModal={() => setShowEditInventoryModal(false)}
          onSubmit={updateInventory}
        />
      ) : null}
    </Page>
  );
};

export default withLoadingSpinner(InventoryDetails);
