import { TableFooter } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { ElementType } from "react";

const SimpleTable = ({
  columns,
  data,
  width,
  containerComponent,
  elevation,
  footer,
  className
}: {
  columns: any[];
  data: any[];
  width?: string;
  containerComponent?: ElementType;
  elevation?: number;
  footer?: JSX.Element;
  className?: string;
}) => {
  return (
    <TableContainer
      component={containerComponent}
      elevation={elevation}
      width={width}
      className={className}
    >
      <Table aria-label="simple table">
        {
          // skip col headings if no labels are included
          columns.filter(col => col.label).length ? (
            <TableHead>
              <TableRow>
                {
                  // column headings
                  columns.map((column, index) => {
                    if (column.options?.display === false) {
                      return null;
                    }
                    return (
                      <TableCell align={column.align} key={`col-head-${index}`}>
                        {column.label}
                      </TableCell>
                    );
                  })
                }
              </TableRow>
            </TableHead>
          ) : null
        }
        <TableBody>
          {
            // table data
            data.map((row, rowIndex) => {
              return (
                <TableRow
                  key={`data-row-${rowIndex}`}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  {columns.map((column, colIndex) => {
                    // handle nested properties
                    const keys = column.name.split(".");
                    let currentValue = row[keys.shift()];
                    while (keys.length > 0) {
                      currentValue = currentValue && currentValue[keys.shift()];
                    }
                    if (column.options?.display === false) {
                      return null;
                    }
                    return (
                      <TableCell
                        align={column.align}
                        key={`data-row-${rowIndex}-col-${colIndex}`}
                      >
                        {column.options?.customBodyRender
                          ? column.options.customBodyRender(currentValue, {
                              rowData: row
                            })
                          : currentValue}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          }
        </TableBody>
        {footer ? (
          <TableFooter>
            <TableRow>
              <TableCell>{footer}</TableCell>
            </TableRow>
          </TableFooter>
        ) : null}
      </Table>
    </TableContainer>
  );
};

export default SimpleTable;
