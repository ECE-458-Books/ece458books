import React, { FormEvent } from "react";
import Table, { TableColumn } from "../components/Table";
import ModifyButton from "../components/modifybutton";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";

interface VendorListState {
  value: string;
  addVendors: string;
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
    this.state = { value: "", addVendors: "" };
  }

  onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    alert("A form was submitted: \n" + this.state.addVendors);

    event.preventDefault();
  };

  render() {
    return <Table<VendorRow> columns={COLUMNS} data={DATA} />;
  }
}

export default VendorList;
