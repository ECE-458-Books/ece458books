import React, { FormEvent } from "react";
import Table, { TableColumn } from "../../components/Table";

interface VendorListState {
  value: string;
}

interface VendorRow {
  name: string;
}

const DATA: VendorRow[] = [
  {
    name: "blah",
  },
];

const COLUMNS: TableColumn[] = [
  {
    field: "name",
    header: "Vendor Name",
    filterPlaceholder: "Search by Name",
  },
];

class VendorList extends React.Component<{}, VendorListState> {
  constructor(props = {}) {
    super(props);
    this.state = { value: "" };
  }

  onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    alert("A form was submitted: \n");

    event.preventDefault();
  };

  render() {
    return <Table<VendorRow> columns={COLUMNS} data={DATA} />;
  }
}

export default VendorList;
