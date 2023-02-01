import React, { FormEvent } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ToggleButton } from "primereact/togglebutton";
import { Calendar, CalendarProps } from "primereact/calendar";

import { DataTable } from "primereact/datatable";
import { Column, ColumnEditorOptions } from "primereact/column";
import { InputNumber } from "primereact/inputnumber";
import { TableColumn } from "../../components/Table";

interface modifyPOState {
  date: any;
  data: SRlineRow[];
  checked: boolean;
}

interface SRlineRow {
  books: string;
  quantity: string;
  unitRetailPrice: string;
}

const data: SRlineRow[] = [
  {
    books: "blah",
    quantity: "blah",
    unitRetailPrice: "blah",
  },
];

const columns: TableColumn[] = [
  { field: "books", header: "Books", filterPlaceholder: "Books" },
  { field: "quantity", header: "Quantity", filterPlaceholder: "Quantity" },
  {
    field: "unit retail price",
    header: "Unit Retail Price",
    filterPlaceholder: "Price",
  },
];

class ModifyPOPage extends React.Component<{}, modifyPOState> {
  constructor(props = {}) {
    super(props);
    this.state = {
      date: new Date(),
      data: data,
      checked: false,
    };
  }

  isPositiveInteger = (val: any) => {
    let str = String(val);

    str = str.trim();

    if (!str) {
      return false;
    }

    str = str.replace(/^0+/, "") || "0";
    const n = Math.floor(Number(str));

    return n !== Infinity && String(n) === str && n >= 0;
  };

  onCellEditComplete = (e: {
    rowData: any;
    newValue: any;
    field: any;
    originalEvent: any;
  }) => {
    const { rowData, newValue, field, originalEvent: event } = e;

    switch (field) {
      case "quantity":
      case "price":
        if (this.isPositiveInteger(newValue)) rowData[field] = newValue;
        else event.preventDefault();
        break;

      default:
        if (newValue.trim().length > 0) rowData[field] = newValue;
        else event.preventDefault();
        break;
    }
  };

  cellEditor = (options: ColumnEditorOptions) => {
    if (options.field === "unit retail price") return this.priceEditor(options);
    else return this.textEditor(options);
  };

  onRowEditComplete = (e: any) => {
    this.setState({ data: e.currentTarget.value });
  };

  textEditor = (options: any) => {
    return (
      <InputText
        type="text"
        value={options.value}
        onChange={(e) => options.editorCallback(e.target.value)}
      />
    );
  };

  priceEditor = (options: any) => {
    return (
      <InputNumber
        value={options.value}
        onValueChange={(e) => options.editorCallback(e.value)}
        mode="currency"
        currency="USD"
        locale="en-US"
      />
    );
  };

  priceBodyTemplate = (rowData: { price: number | bigint }) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(rowData.price);
  };

  onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    this.setState({ checked: false });
    alert(
      "A form was submitted: \n" + this.state.date + "\n" + this.state.checked
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
            showButtonBar
            onChange={(event: CalendarProps): void => {
              this.setState({ date: event.value });
            }}
          />

          <DataTable
            value={data}
            editMode="row"
            dataKey="id"
            onRowEditComplete={this.onRowEditComplete}
            responsiveLayout="scroll"
          >
            <Column
              field="book"
              header="Books"
              editor={(options) => this.textEditor(options)}
              style={{ width: "20%" }}
            ></Column>
            <Column
              field="quantity"
              header="Quantity"
              editor={(options) => this.textEditor(options)}
              style={{ width: "20%" }}
            ></Column>
            <Column
              field="unit retail price"
              header="Unit Retail Price"
              body={this.priceBodyTemplate}
              editor={(options) => this.priceEditor(options)}
              style={{ width: "20%" }}
            ></Column>
            <Column
              rowEditor={this.state.checked}
              headerStyle={{ width: "10%", minWidth: "8rem" }}
              bodyStyle={{ textAlign: "center" }}
            ></Column>
          </DataTable>

          {/* <DataTable
            value={data}
            editMode="cell"
            disabled={!this.state.checked}
            className="editable-cells-table"
            responsiveLayout="scroll"
          >
            {columns.map(({ field, header }) => {
              return (
                <Column
                  key={field}
                  field={field}
                  header={header}
                  style={{ width: "25%" }}
                  body={field === "unit retail price" && this.priceBodyTemplate}
                  editor={(options) => this.cellEditor(options)}
                  onCellEditComplete={this.onCellEditComplete}
                />
              );
            })}
          </DataTable> */}

          {/* <label htmlFor="book">Book</label>
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
          /> */}

          <Button label="submit" type="submit" />
        </form>
      </div>
    );
  }
}

export default ModifyPOPage;
