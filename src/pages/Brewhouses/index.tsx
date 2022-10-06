import useAPI from "../../hooks/useAPI";
import DataTable, {columnOptions} from "../../components/DataTable";
import Page from "../../components/Page";
import { useState } from "react";

const Brewhouses = props => {
  const [tableData, setTableData] = useState([]);
  const options = {
    sortThirdClickReset: true
  };
  const columns = [
    {
      label: "Name",
      name: "name",
      options
    },
    {
      label: "Date created",
      name: "created_at",
      options: columnOptions.dateOptions
    }
  ]
  return (
    <Page>
      <DataTable
        data={tableData}
        columns={columns}
      />
    </Page>
  );
}

export default Brewhouses;