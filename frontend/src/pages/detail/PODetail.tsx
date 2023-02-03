import React, { FormEvent } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ToggleButton } from "primereact/togglebutton";
import { Calendar, CalendarProps } from "primereact/calendar";
import { Dropdown, DropdownProps } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { TableColumn } from "../../components/Table";
import { Column, ColumnEditorOptions } from "primereact/column";
import { InputNumber } from "primereact/inputnumber";
import ConfirmButton from "../../components/ConfirmButton";

interface modifyPOState {
  date: any;
  vendor: string;
  checked: boolean;
  confirmationPopup: boolean;
}

interface Vendors {
  name: string;
  code: string;
}

const dataVendors: Vendors[] = [
  { name: "New York", code: "NY" },
  { name: "Rome", code: "RM" },
  { name: "London", code: "LDN" },
  { name: "Istanbul", code: "IST" },
  { name: "Paris", code: "PRS" },
];

interface POlineRow {
  books: string;
  quantity: number;
  unitRetailPrice: number;
}

const dataPO: POlineRow[] = [
  {
    books: "blah",
    quantity: 20,
    unitRetailPrice: 3.9,
  },
  {
    books: "ohaha",
    quantity: 200,
    unitRetailPrice: 4.0,
  },
];

const columns: TableColumn[] = [
  { field: "books", header: "Books", filterPlaceholder: "Books" },
  { field: "quantity", header: "Quantity", filterPlaceholder: "Quantity" },
  {
    field: "unitRetailPrice",
    header: "Unit Retail Price",
    filterPlaceholder: "Price",
  },
];

class ModifyPOPage extends React.Component<{}, modifyPOState> {
  constructor(props = {}) {
    super(props);
    this.state = {
      date: new Date(),
      vendor: "asdfa",
      checked: false,
      confirmationPopup: false,
    };
  }

  isPositiveInteger = (val: any) => {
    let str = String(val);

    str = str.trim();

    if (!str) {
      return false;
    }

    str = str.replace(/^0+/, "") || "0";
    const n = Number(str);

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
        if (this.isPositiveInteger(newValue)) rowData[field] = newValue;
        else event.preventDefault();
        break;
      case "unitRetailPrice":
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
    if (options.field === "unitRetailPrice") return this.priceEditor(options);
    if (options.field === "quantity") return this.numberEditor(options);
    else return this.textEditor(options);
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

  numberEditor = (options: any) => {
    return (
      <InputNumber
        value={options.value}
        onValueChange={(e) => options.editorCallback(e.target.value)}
        mode="decimal"
      />
    );
  };

  priceEditor = (options: any) => {
    return (
      <InputNumber
        value={options.value}
        onValueChange={(e) => options.editorCallback(e.target.value)}
        mode="currency"
        currency="USD"
        locale="en-US"
      />
    );
  };

  priceBodyTemplate = (rowData: { unitRetailPrice: number | bigint }) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(rowData.unitRetailPrice);
  };

  onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    this.setState({ checked: false });
    alert(
      "A form was submitted: \n" +
        this.state.date +
        "\n" +
        this.state.vendor +
        "\n" +
        this.state.checked +
        "\n" +
        JSON.stringify(dataPO)
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
            options={dataVendors}
            disabled={!this.state.checked}
            onChange={(event: DropdownProps): void => {
              this.setState({ vendor: event.value.name });
            }}
            optionLabel="name"
          />

          <DataTable
            value={dataPO}
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
                  body={field === "unitRetailPrice" && this.priceBodyTemplate}
                  editor={(options) => this.cellEditor(options)}
                  onCellEditComplete={this.onCellEditComplete}
                />
              );
            })}
          </DataTable>

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

export default ModifyPOPage;
