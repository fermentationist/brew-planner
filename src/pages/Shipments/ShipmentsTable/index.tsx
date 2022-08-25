import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InventoryIcon from "@mui/icons-material/InventoryOutlined";
import DataTable, {
  getRowData,
  columnOptions
} from "../../../components/DataTable";
const {
  options,
  dateOptions,
  booleanOptions,
  moneyOptions,
  externalLabelOptions,
  labelDataOptions
} = columnOptions;

export const defaultShipmentColumns = [
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
    options: {
      ...options
    }
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
    label: "Cancelled at",
    name: "shipment.cancelledAt",
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
    label: "Rejected",
    name: "shipment.isRejected",
    options: {
      display: false,
      ...booleanOptions
    }
  },
  {
    label: "Cancelled",
    name: "shipment.isCancelled",
    options: {
      display: false,
      ...booleanOptions
    }
  },
  {
    label: "Status",
    name: "shipment.status",
    options: {
      display: false,
      ...options
    }
  },
  {
    label: "Order cancelled at",
    name: "order.cancelledAt",
    options: {
      display: false,
      ...dateOptions
    }
  },
  {
    label: "Order cancelled",
    name: "order.isCancelled",
    options: {
      display: false,
      ...booleanOptions
    }
  },
  {
    label: "Billing street",
    name: "order.billingAddress.street",
    options: {
      display: false,
      ...options
    }
  },
  {
    label: "Billing unit",
    name: "order.billingAddress.unit",
    options: {
      display: false,
      ...options
    }
  },
  {
    label: "Billing state",
    name: "order.billingAddress.state",
    options: {
      display: false,
      ...options
    }
  },
  {
    label: "Billing zip",
    name: "order.billingAddress.zip",
    options: {
      display: false,
      ...options
    }
  },
  {
    label: "Billing country",
    name: "order.billingAddress.country",
    options: {
      display: false,
      ...options
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
  {
    label: "Customer selected shipping method",
    name: "shipping.customerSelectedMethod",
    options
  },
  {
    label: "Shipping service name",
    name: "shippingService.name",
    options
  },
  {
    label: "Shipping carrier",
    name: "shippingService.carrier",
    options: {
      display: false,
      ...options
    }
  },
  {
    label: "Shipping method",
    name: "shippingService.method",
    options: {
      display: false,
      ...options
    }
  },
  {
    label: "Shipping service active",
    name: "shippingService.isActive",
    options: {
      display: false,
      ...booleanOptions
    }
  },
  {
    label: "Tracking code",
    name: "shipment.trackingCode",
    options // todo: make tracking code a link to carrier tracking page
  },
  {
    label: "Shipping labels",
    name: "shipment.labelData",
    options: labelDataOptions
  },
  {
    label: "Shipping label type",
    name: "shipment.labelFileType",
    options: {
      display: false,
      ...options
    }
  },
  {
    label: "External label",
    name: "shipment.externalLabelUrl",
    options: externalLabelOptions
  },
  {
    label: "Picked at",
    name: "shipment.pickedAt",
    options: dateOptions
  },
  {
    label: "Packed at",
    name: "shipment.packedAt",
    options: dateOptions
  },
  { 
    label: "Pickup at",
    name: "shipment.pickupAt",
    options: dateOptions
  },
  {
    label: "Shipped at",
    name: "shipment.shippedAt",
    options: dateOptions
  },
  {
    label: "Delivered at",
    name: "shipment.deliveredAt",
    options: dateOptions
  },
  {
    label: "Delivery start",
    name: "shipment.expectedDeliveryStart",
    options: dateOptions
  },
  {
    label: "Delivery end",
    name: "shipment.expectedDeliveryEnd",
    options: dateOptions
  },
  // {
  //   "shipment": {
  //     *"trackingCode": null,
  //     *"isAccepted": false,
  //     *"isRejected": false,
  //     *"isCancelled": true,
  //     *"status": "cancelled",
  //     *"createdAt": 1660573580000,
  //     *"acceptedAt": null,
  //     *"rejectedAt": null,
  //     *"pickedAt": null,
  //     *"packedAt": null,
  //     *"shippedAt": null,
  //     *"deliveredAt": null,
  //     *"cancelledAt": 1660573615000,
  //     *"customerSelectedMethod": "Economy",
  //     *"pickupAt": null,
  //     "expectedDeliveryStart": null,
  //     "expectedDeliveryEnd": null,
  //     *"labelData": null,
  //     *"labelFileType": null,
  //     "externalLabelUrl": null,
  //     *"shipmentId": "2416b872-1cd0-11ed-81ee-bf205f7d5639",
  //     "shippingAddress": {
  //       "street": null,
  //       "unit": null,
  //       "city": null,
  //       "state": null,
  //       "zip": null,
  //       "country": "United States"
  //     }
  //   },
  //   *"shippingService": {
  //     "name": null,
  //     "method": null,
  //     "carrier": null,
  //     "isActive": false
  //   },
  //   "items": [
  //     {
  //       "sku": "fe2cccd9",
  //       "upc": "737212008271",
  //       "width": 5,
  //       "height": 5,
  //       "length": 15,
  //       "weight": 4,
  //       "fullname": "Griffo Scott Street Gin (750ml)",
  //       "quantity": 1,
  //       "brandName": "Griffo Distillery",
  //       "productName": "Griffo Scott Street Gin",
  //       "variantName": "750ml"
  //     },
  //     {
  //       "sku": "b76fa7c5",
  //       "upc": "602401588516",
  //       "width": 5,
  //       "height": 5,
  //       "length": 15,
  //       "weight": 4,
  //       "fullname": "SILO Cacao Vodka (750ml)",
  //       "quantity": 2,
  //       "brandName": "SILO Distillery",
  //       "productName": "Cacao Vodka",
  //       "variantName": "750ml"
  //     }
  //   ],
  //   "order": {
  //     *"orderId": "2415621a-1cd0-11ed-81ee-bf205f7d5639",
  //     *"externalId": "4873704145133",
  //     *"email": "emarschall@spirithub.com",
  //     *"placedAt": 1660573580000,
  //     *"isCancelled": true,
  //     *"cancelledAt": 1660573615000,
  //     *"subtotal": 46,
  //     *"tax": 5.23,
  //     *"shippingFee": 4.9,
  //     *"total": 56.13,
  //     *"billToFirst": "Ehren",
  //     *"billToLast": "Marschall",
  //     *"billingAddress": {
  //       "street": "6428 North Ridgeway Avenue",
  //       "unit": null,
  //       "city": "Lincolnwood",
  //       "state": "IL",
  //       "zip": null,
  //       "country": "US"
  //     }
  //   }
  // }
  // {
  //   label: "Email",
  //   name: "email",
  //   options: {
  //     display: false,
  //     ...options
  //   }
  // },
  // {
  //   label: "Subtotal",
  //   name: "subtotal",
  //   options: {
  //     customBodyRender: (value: number) => value.toFixed(2),
  //     ...options
  //   }
  // },
  // {
  //   label: "Tax",
  //   name: "tax",
  //   options: {
  //     customBodyRender: (value: number) => value.toFixed(2),
  //     ...options
  //   }
  // },
  // {
  //   label: "Shipping fee",
  //   name: "shippingFee",
  //   options: {
  //     customBodyRender: (value: number) => value.toFixed(2),
  //     ...options
  //   }
  // },
  // {
  //   label: "Total",
  //   name: "total",
  //   options: {
  //     customBodyRender: (value: number) => value.toFixed(2),
  //     ...options
  //   }
  // },
  // {
  //   label: "",
  //   name: "",
  //   options: {
  //     customBodyRender: (value: any, meta: any) => {
  //       return (
  //         <Tooltip title="process shipment">
  //           <IconButton
  //             onClick={processShipment.bind(null, getRowData(meta.rowData))}
  //           >
  //             <InventoryIcon />
  //           </IconButton>
  //         </Tooltip>
  //       );
  //     },
  //     sort: false,
  //     searchable: false,
  //     ...options
  //   }
  // }
];
const ShipmentsTable = ({
  data,
  columns,
  filterFn = (x: any) => true,
  refresh
}: {
  columns?: any[];
  filterFn: (row: any) => boolean;
  refresh: () => void;
}) => {
  const processShipment = rowData => {
    console.log("rowData in processShipment:", rowData);
  };

  const showLabels = (labelData, labelFileType) => {
    console.log("show labels of type:", labelFileType);
    // todo: open modal to show/print labels?
  };
  const defaultColumns = [
    ...defaultShipmentColumns,
    {
      label: "",
      name: "",
      options: {
        customBodyRender: (value: any, meta: any) => {
          return (
            <Tooltip title="process shipment">
              <IconButton
                onClick={processShipment.bind(null, getRowData(meta.rowData))}
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
    }
  ];
  return (
    <DataTable
      data={data.filter(filterFn)}
      columns={columns || defaultColumns}
      refresh={refresh}
      width="calc(100vw - 1.5%)"
    />
  );
};

export default ShipmentsTable;
