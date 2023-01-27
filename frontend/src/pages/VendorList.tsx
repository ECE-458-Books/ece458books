import React from "react";
import Table, { TableColumn } from "../components/Table";

interface VendorListState {
  value: string;
}

interface VendorRow {
  name: string;
}

const data: VendorRow[] = [
  {
    name: "blah",
  },
];

const columns: TableColumn[] = [{ field: "name", header: "Vendor Name" }];

class VendorListPage extends React.Component<{}, VendorListState> {
  constructor(props = {}) {
    super(props);
    this.state = { value: "" };
  }

  render() {
    return <Table<VendorRow> columns={columns} data={data} />;
  }
}

export default VendorListPage;
