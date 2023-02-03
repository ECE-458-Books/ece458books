import React, { FormEvent } from "react";
import { InputText } from "primereact/inputtext";
import { ToggleButton } from "primereact/togglebutton";
import { Calendar, CalendarProps } from "primereact/calendar";
import { DataTable } from "primereact/datatable";
import { Column, ColumnEditorOptions } from "primereact/column";
import { InputNumber } from "primereact/inputnumber";
import { TableColumn } from "../../components/Table";
import ConfirmButton from "../../components/ConfirmButton";

interface modifyPOState {
  date: any;
  data: SRlineRow[];
  checked: boolean;
  confirmationPopup: boolean;
}

interface SRlineRow {
  books: string;
  quantity: number;
  unitRetailPrice: number;
}

const data: SRlineRow[] = [
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
      data: data,
      checked: false,
      confirmationPopup: false,
    };

    this.onSubmit = this.onSubmit.bind(this);
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
        this.state.checked +
        "\n" +
        JSON.stringify(data)
    );

    event.preventDefault();
  };

  render() {
    return (
      <div>
        <h1>Modify Sales Reconciliation</h1>
        <form id="localForm">
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
          {/* <ConfirmDialog
            id={randomUUID()}
            visible={this.state.confirmationPopup}
            onHide={() => this.setState({ confirmationPopup: false })}
            message="Are you sure you want to proceed?"
            header="Confirmation"
            icon="pi pi-exclamation-triangle"
            accept={() => {
              alert("A form was submitted: \n");
              this.onSubmitForm;
            }}
            reject={() => {
              console.log("reject");
            }}
          />
          <Button
            id="submit"
            type="button"
            onClick={(e) => {
              this.setState({ confirmationPopup: true });
            }}
            disabled={!this.state.checked}
            label="submit"
          /> */}
          {/* <Button type="submit" onClick={this.onSubmit} /> */}
        </form>
      </div>
    );
  }
}

export default ModifyPOPage;
