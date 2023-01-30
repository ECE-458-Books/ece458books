import React, { FormEvent } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ToggleButton } from "primereact/togglebutton";
import { Calendar, CalendarProps } from "primereact/calendar";

interface modifyPOState {
  date: any;
  book: string;
  quantity: string;
  unitRetailPrice: string;
  checked: boolean;
}

class ModifyPOPage extends React.Component<{}, modifyPOState> {
  constructor(props = {}) {
    super(props);
    this.state = {
      date: new Date(),
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
        <h1>Modify Sales Reconciliation</h1>
        <form onSubmit={this.onSubmit}>
          <ToggleButton
            id="modifySRToggle"
            name="modifySRToggle"
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
            onChange={(event: CalendarProps): void => {
              this.setState({ date: event.value });
            }}
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
