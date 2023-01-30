import React, { FormEvent } from "react";
import Table, { TableColumn } from "../components/table";
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

const data: VendorRow[] = [
  {
    name: "blah",
  },
];

const columns: TableColumn[] = [{ field: "name", header: "Vendor Name" }];

class VendorListPage extends React.Component<{}, VendorListState> {
  constructor(props = {}) {
    super(props);
    this.state = { value: "", addVendors: "" };
  }

  onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    alert("A form was submitted: \n" + this.state.addVendors);

    event.preventDefault();
  };

  render() {
    return (
      <div>
        <ModifyButton path="/modifyvendor" />
        <form onSubmit={this.onSubmit}>
          <span className="p-float-label">
            <InputTextarea
              autoResize
              id="addVendors"
              name="addVendors"
              value={this.state.addVendors}
              onChange={(event: FormEvent<HTMLTextAreaElement>): void =>
                this.setState({ addVendors: event.currentTarget.value })
              }
              rows={2}
              cols={30}
            />
            <label htmlFor="addVendors">Add Vendors</label>
          </span>
          <Button label="submit" type="submit" />
        </form>
        <Table<VendorRow> columns={columns} data={data} />
      </div>
    );
  }
}

export default VendorListPage;
