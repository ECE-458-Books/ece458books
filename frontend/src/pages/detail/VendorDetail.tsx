import React, { FormEvent } from "react";
import { InputText } from "primereact/inputtext";
import { ToggleButton } from "primereact/togglebutton";
import ConfirmButton from "../../components/ConfirmButton";

interface modifyVendorState {
  vendor: string;
  isModifiable: boolean;
  isConfirmationPopVisible: boolean;
}

class ModifyVendorPage extends React.Component<{}, modifyVendorState> {
  constructor(props = {}) {
    super(props);
    this.state = {
      vendor: "asdfasv",
      isModifiable: false,
      isConfirmationPopVisible: false,
    };
  }

  onSubmit = (): void => {
    this.setState({ isModifiable: false });

    alert(
      "A form was submitted: \n" +
        this.state.vendor +
        "\n" +
        this.state.isModifiable
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
            checked={this.state.isModifiable}
            onChange={() =>
              this.setState({ isModifiable: !this.state.isModifiable })
            }
          />

          <label htmlFor="vendor">Vendor</label>
          <InputText
            id="vendor"
            className="p-inputtext-sm"
            name="genre"
            value={this.state.vendor}
            disabled={!this.state.isModifiable}
            onChange={(event: FormEvent<HTMLInputElement>): void => {
              this.setState({ vendor: event.currentTarget.value });
            }}
          />

          <ConfirmButton
            isVisible={this.state.isConfirmationPopVisible}
            hideFunc={() => this.setState({ isConfirmationPopVisible: false })}
            acceptFunc={this.onSubmit}
            rejectFunc={() => {
              console.log("reject");
            }}
            buttonClickFunc={() => {
              this.setState({ isConfirmationPopVisible: true });
            }}
            disabled={!this.state.isModifiable}
            label={"Submit"}
          />
          {/* Maybe be needed in case the confrim button using the popup breaks */}
          {/* <Button disabled={!this.state.isModifiable} label="submit" type="submit" /> */}
        </form>
      </div>
    );
  }
}

export default ModifyVendorPage;
