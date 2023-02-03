import React, { FormEvent } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ToggleButton } from "primereact/togglebutton";
import ConfirmButton from "../../components/ConfirmButton";

interface modifyVendorState {
  vendor: string;
  checked: boolean;
  confirmationPopup: boolean;
}

class ModifyVendorPage extends React.Component<{}, modifyVendorState> {
  constructor(props = {}) {
    super(props);
    this.state = {
      vendor: "asdfasv",
      checked: false,
      confirmationPopup: false,
    };
  }

  onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    this.setState({ checked: false });

    alert(
      "A form was submitted: \n" + this.state.vendor + "\n" + this.state.checked
    );
  };

  render() {
    return (
      <div>
        <h1>Modify Vendor</h1>
        <form onSubmit={this.onSubmit}>
          <ToggleButton
            id="modifyVendorToggle"
            name="modifyVendorToggle"
            onLabel="Modifiable"
            offLabel="Modify"
            onIcon="pi pi-check"
            offIcon="pi pi-times"
            checked={this.state.checked}
            onChange={(e) => this.setState({ checked: !this.state.checked })}
          />

          <label htmlFor="vendor">Vendor</label>
          <InputText
            id="vendor"
            className="p-inputtext-sm"
            name="genre"
            value={this.state.vendor}
            disabled={!this.state.checked}
            onChange={(event: FormEvent<HTMLInputElement>): void => {
              this.setState({ vendor: event.currentTarget.value });
            }}
          />

          <ConfirmButton
            confirmationPopup={this.state.confirmationPopup}
            hideFunc={() => this.setState({ confirmationPopup: false })}
            acceptFunc={this.onSubmit}
            rejectFunc={() => {
              console.log("reject");
            }}
            buttonClickFunc={() => {
              this.setState({ confirmationPopup: true });
            }}
            disabled={!this.state.checked}
            label={"Submit"}
          />
          {/* <Button disabled={!this.state.checked} label="submit" type="submit" /> */}
        </form>
      </div>
    );
  }
}

export default ModifyVendorPage;
