import MUIDataTable, { MUIDataTableOptions, MUIDataTableColumn, MUIDataTableColumnOptions, MUIDataTableMeta } from "mui-datatables";
import { styled as muiStyled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import TrueIcon from "@mui/icons-material/Check";
import FalseIcon from "@mui/icons-material/Close";
import LabelIcon from "@mui/icons-material/StickyNote2";
import Tooltip from "@mui/material/Tooltip";
import LabelPopper from "../LabelPopper";
import DatePopper from "../DatePopper";

let cols: any[] = [];

export type UpdateValueFunction = (newValue: any) => void;
export interface MetaObject {
  rowIndex: number;
  columnIndex: number;
  columnData: {
    [key: string]: any;
  };
  currentTableData: {
    [key: string]: any;
  }[];
  rowData: any[];
  tableData: any[][];
  tableState: {
    [key: string]: any;
  };
}

interface DataTableProps {
  data: any[];
  columns: MUIDataTableColumn[];
  title?: string;
  width?: string;
  options?: {
    [key: string]: any;
  };
  className?: string;
}

const StyledMUIDataTable = muiStyled(MUIDataTable)<DataTableProps>`
  width: ${props => props.width || "calc(100vw - 1.5%)"};
  @media screen and (max-width: 600px) {
    width: calc(100vw - 2em);
  }
`;

const DataTable = ({
  data,
  columns,
  title,
  options,
  width,
  refresh,
  className
}: {
  data: { [key: string]: any }[];
  columns: any[];
  title?: string;
  options?: Record<string, any>;
  width?: string;
  refresh?: () => void;
  className?: string;
}) => {
  cols = columns;
  const tableOptions: MUIDataTableOptions = {
    jumpToPage: true,
    filter: false,
    enableNestedDataAccess: ".",
    selectableRows: "none",
    rowsPerPageOptions: [10, 25, 50, 100],
    print: false
  };

  return (
    <>
      {refresh ? (
        <Tooltip title="Refresh">
          <IconButton onClick={refresh}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      ) : null}
      <StyledMUIDataTable
        data={data}
        columns={columns}
        title={title}
        width={width}
        className={className}
        options={
          options
            ? {
                ...tableOptions,
                ...options
              }
            : tableOptions
        }
      />
    </>
  );
};

export default DataTable;

// getColumnIndex:
// rowData is returned by mui-datatables as an array of column values, without any keys. This function takes in the column name and returns the index of that column for use with rowData array
export const getColumnIndex = (columnName: string) => {
  const columnNames = cols.map(column => column.name);
  return columnNames.indexOf(columnName);
};

// getRowData:
// rowData is returned by mui-datatables as an array of column values, without any keys. This function transforms the rowData array into an object that uses the column names as keys
export const getRowData = (dataArray: any[]) => {
  const columnNames = cols.map(column => column.name);
  const rowData = columnNames.reduce((map, name, index) => {
    if (name) {
      map[name] = dataArray[index];
    }
    return map;
  }, {});
  const expandedData = expandObject(rowData);
  return expandedData;
};

// utility function to turn an object with dot-notation keys into a nested object. i.e. {"first.second": "value"} becomes {first: {second: "value"}}
export const expandObject = (obj: { [key: string]: any }) => {
  for (const key in obj) {
    const [newKey, newValue] = expandField(key, obj[key]);
    delete obj[key];
    if (newKey in obj && newValue && typeof newValue === "object") {
      if (Array.isArray(obj[newKey])) {
        obj[newKey] = [...obj[newKey], ...newValue];
      } else if (obj[newKey] && typeof obj[newKey] === "object") {
        obj[newKey] = {
          ...obj[newKey],
          ...newValue
        };
      }
    } else {
      obj[newKey] = newValue;
    }
  }
  return obj;
};
// recursive function used by expandObject
const expandField = (key: string, value: any): any[] => {
  const [newKey, ...remainder] = key.split(".");
  if (remainder.length === 0) {
    return [key, value];
  }
  if (remainder.length === 1) {
    const newValue = {
      [remainder[0]]: value
    };
    return [newKey, newValue];
  }
  const [newKey2, newValue2] = expandField(remainder.join("."), value);
  const newValue = {
    [newKey2]: newValue2
  };
  return [newKey, newValue];
};

export const columnOptions = ((): Record<string, MUIDataTableColumnOptions> => {
  const options = {
    sortThirdClickReset: true
  };
  const labelDataOptions = {
    ...options,
    download: false,
    customBodyRender: (labelData: string, meta: MUIDataTableMeta) => {
      if (!labelData) {
        return null;
      }
      const rowData = getRowData(meta.rowData);
      return (
        <LabelPopper labelData={labelData} labelFileType={rowData.shipment.labelFileType} />
      );
    }
  };
  const externalLabelOptions = {
    ...options,
    download: false,
    customBodyRender: (labelUrl: string) => {
      if (!labelUrl) {
        return null;
      }
      return (
        <Tooltip title="view label">
          <IconButton onClick={() => window.open(labelUrl, "_blank")}>
            <LabelIcon />
          </IconButton>
        </Tooltip>
      );
    }
  };
  const dateOptions = {
    customBodyRender: (value: number) => {
      if (!value) {
        return null;
      }
      const newDate = new Date(value);
      return (
        <DatePopper date={newDate} />
      );
    },
    ...options
  };
  const booleanOptions = {
    customBodyRender: (value: boolean) => {
      return value ? (
        <Tooltip title="true">
          <TrueIcon />
        </Tooltip>
      ) : (
        <Tooltip title="false">
          <FalseIcon />
        </Tooltip>
      );
    },
    ...options
  };
  const moneyOptions = {
    customBodyRender: (value: number | string) => {
      return typeof value === "number" ? `$${value.toFixed(2)}` : `$${value}`;
    }
  };
  const actionOptions = {
    empty: true,
    filter: false,
    searchable: false,
    sort: false
  }

  return {
    options,
    dateOptions,
    booleanOptions,
    moneyOptions,
    externalLabelOptions,
    labelDataOptions,
    actionOptions
  };
})();
