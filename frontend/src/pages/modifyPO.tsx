import React, { FormEvent } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ToggleButton } from "primereact/togglebutton";
import { Calendar, CalendarProps } from "primereact/calendar";
import { Dropdown, DropdownProps } from "primereact/dropdown";

interface modifyPOState {
  date: any;
  vendor: string;
  book: string;
  quantity: string;
  unitRetailPrice: string;
  checked: boolean;
}

interface Vendors {
  name: string;
  code: string;
}

const data: Vendors[] = [
  { name: "New York", code: "NY" },
  { name: "Rome", code: "RM" },
  { name: "London", code: "LDN" },
  { name: "Istanbul", code: "IST" },
  { name: "Paris", code: "PRS" },
];

class ModifyPOPage extends React.Component<{}, modifyPOState> {
  constructor(props = {}) {
    super(props);
    this.state = {
      date: new Date(),
      vendor: "asdfa",
      book: "fasasfm",
      quantity: "fasasfm",
      unitRetailPrice: "fasasfm",
      checked: false,
    };
  }

  onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    this.setState({ checked: false });
    alert(
      "A form was submitted: \n" +
        this.state.date +
        "\n" +
        this.state.vendor +
        "\n" +
        this.state.book +
        "\n" +
        this.state.quantity +
        "\n" +
        this.state.unitRetailPrice +
        "\n" +
        this.state.checked
    );

    event.preventDefault();
  };

  render() {
    return (
      <div>
        <h1>Modify Purchase Order</h1>
        <form onSubmit={this.onSubmit}>
          <ToggleButton
            id="modifyPOToggle"
            name="modifyPOToggle"
            onLabel="Modifiable"
            offLabel="Modify"
            onIcon="pi pi-check"
            offIcon="pi pi-times"
            checked={this.state.checked}
            onChange={(e) => this.setState({ checked: !this.state.checked })}
          />

          <label htmlFor="date">Date</label>
          <Calendar
            id="date"
            disabled={!this.state.checked}
            value={this.state.date}
            showButtonBar
            onChange={(event: CalendarProps): void => {
              this.setState({ date: event.value });
            }}
          />

          <label htmlFor="vendor">Vendor</label>
          <Dropdown
            value={this.state.vendor}
            placeholder={this.state.vendor}
            options={[
              { name: "New York", code: "NY" },
              { name: "Rome", code: "RM" },
              { name: "London", code: "LDN" },
              { name: "Istanbul", code: "IST" },
              { name: "Paris", code: "PRS" },
            ]}
            disabled={!this.state.checked}
            onChange={(event: DropdownProps): void => {
              this.setState({ vendor: event.value.name });
            }}
            optionLabel="name"
          />

          <label htmlFor="book">Book</label>
          <InputText
            id="book"
            className="p-inputtext-sm"
            name="book"
            value={this.state.book}
            disabled={!this.state.checked}
            onChange={(event: FormEvent<HTMLInputElement>): void => {
              this.setState({ book: event.currentTarget.value });
            }}
          />

          <label htmlFor="quantity">Quantity</label>
          <InputText
            id="quantity"
            className="p-inputtext-sm"
            name="quantity"
            value={this.state.quantity}
            disabled={!this.state.checked}
            onChange={(event: FormEvent<HTMLInputElement>): void => {
              this.setState({ quantity: event.currentTarget.value });
            }}
          />

          <label htmlFor="unitRetailPrice">Unit Retail Price</label>
          <InputText
            id="unitRetailPrice"
            className="p-inputtext-sm"
            name="unitRetailPrice"
            value={this.state.unitRetailPrice}
            disabled={!this.state.checked}
            onChange={(event: FormEvent<HTMLInputElement>): void => {
              this.setState({ unitRetailPrice: event.currentTarget.value });
            }}
          />

          <Button label="submit" type="submit" />
        </form>
      </div>
    );
  }
}

export default ModifyPOPage;
