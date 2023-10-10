import MUIDataTable, {
  MUIDataTableOptions,
  MUIDataTableColumn,
  MUIDataTableColumnOptions,
  MUIDataTableMeta,
} from "mui-datatables";
import { styled as muiStyled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import TrueIcon from "@mui/icons-material/Check";
import FalseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import ListIcon from "@mui/icons-material/List";
import Tooltip from "@mui/material/Tooltip";
import DatePopper from "../DatePopper";
import TextEllipsis from "../TextEllipsis";
import { memo, ReactNode } from "react";
import { deepEquals } from "../../utils/helpers";
import { create } from "@mui/material/styles/createTransitions";

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
  width: ${(props) => props.width || "calc(100vw - 1.5%)"};
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
  className,
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
    print: false,
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
                ...options,
              }
            : tableOptions
        }
      />
    </>
  );
};

export default memo(DataTable, (prevProps, nextProps) => {
  return deepEquals(prevProps, nextProps);
});

export type DataTableColumn = MUIDataTableColumn;
export type DataTableColumnOptions = MUIDataTableColumnOptions;
export type DataTableMeta = MUIDataTableMeta;
// getColumnIndex:
// rowData is returned by mui-datatables as an array of column values, without any keys. This function takes in the column name and returns the index of that column for use with rowData array
export const getColumnIndex = (columnName: string) => {
  const columnNames = cols.map((column) => column.name);
  return columnNames.indexOf(columnName);
};

// getRowData:
// rowData is returned by mui-datatables as an array of column values, without any keys. This function transforms the rowData array into an object that uses the column names as keys.
export const getRowData = (dataArray: any[]) => {
  const columnNames = cols.map((column) => column.name);
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
          ...newValue,
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
      [remainder[0]]: value,
    };
    return [newKey, newValue];
  }
  const [newKey2, newValue2] = expandField(remainder.join("."), value);
  const newValue = {
    [newKey2]: newValue2,
  };
  return [newKey, newValue];
};

export const columnOptions = ((): Record<string, any> => {
  const options = { sortThirdClickReset: true };
  const dateOptions = {
    ...options,
    customBodyRender: (value: number) => {
      if (!value) {
        return null;
      }
      const newDate = new Date(value);
      return <DatePopper date={newDate} />;
    },
  };
  const booleanOptions = {
    ...options,
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
  };
  const createEllipsisOptions = (maxLength: number) => {
    return {
      ...options,
      customBodyRender: (value: string) => {
        if (!value) {
          return null;
        }
        return <TextEllipsis value={value} maxLength={maxLength} />;
        const valueWithEllipsis =
          value.length > maxLength ? `${value.slice(0, 20)}...` : value;
        return (
          <Tooltip title={value}>
            <span>{valueWithEllipsis}</span>
          </Tooltip>
        );
      },
    };
  };

  const moneyOptions = {
    ...options,
    customBodyRender: (value: number | string) => {
      const currencyFormatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      });
      return currencyFormatter.format(Number(value));
    },
  };
  const actionOptions = {
    empty: true,
    filter: false,
    searchable: false,
    sort: false,
    download: false,
    viewColumns: false,
  };

  const rowDataOptions = {
    display: "excluded",
    download: false,
    filter: false,
    sort: false,
  };

  // const createRenderEditButtonOptions = (
  //   tooltipText: string,
  //   callback: (rowData: any) => void
  // ) => {
  //   return {
  //     customBodyRender: (value: any, meta: MUIDataTableMeta) => {
  //       return (
  //         <Tooltip title={tooltipText}>
  //           <IconButton onClick={callback.bind(null, getRowData(meta.rowData))}>
  //             <EditIcon />
  //           </IconButton>
  //         </Tooltip>
  //       );
  //     },
  //     ...actionOptions,
  //   };
  // };

  const createRenderButtonColumnOptionsFactory =
    (iconComponent: ReactNode) =>
    (tooltipText: string, callback: (rowData: any) => void) => {
      return {
        customBodyRender: (value: any, meta: MUIDataTableMeta) => {
          return (
            <Tooltip title={tooltipText}>
              <IconButton
                onClick={callback.bind(null, getRowData(meta.rowData))}
              >
                {iconComponent}
              </IconButton>
            </Tooltip>
          );
        },
        ...actionOptions,
      };
    };

  const createRenderEditButtonOptions =
    createRenderButtonColumnOptionsFactory(<EditIcon />);

  const createRenderChildEntitiesButtonOptions = createRenderButtonColumnOptionsFactory(<ListIcon />);

  return {
    options,
    dateOptions,
    booleanOptions,
    moneyOptions,
    actionOptions,
    rowDataOptions,
    createEllipsisOptions,
    createRenderEditButtonOptions,
    createRenderChildEntitiesButtonOptions,
  };
})();
