import React from "react";
import { ToggleButton } from "primereact/togglebutton";
import { Calendar, CalendarProps } from "primereact/calendar";
import { DataTable } from "primereact/datatable";
import { Column, ColumnEditorOptions } from "primereact/column";
import { TableColumn } from "../../components/Table";
import ConfirmButton from "../../components/ConfirmButton";
import {
  isPositiveInteger,
  numberEditor,
  priceBodyTemplate,
  priceEditor,
  textEditor,
} from "../../util/TableCellEditFuncs";

interface modifyPOState {
  date: any;
  data: SRSaleRow[];
  isModifiable: boolean;
  isConfirmationPopVisible: boolean;
}

interface SRSaleRow {
  books: string;
  quantity: number;
  unitRetailPrice: number;
}

const DATA: SRSaleRow[] = [
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

const COLUMNS: TableColumn[] = [
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
      data: DATA,
      isModifiable: false,
      isConfirmationPopVisible: false,
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  onCellEditComplete = (e: {
    rowData: any;
    newValue: any;
    field: string;
    originalEvent: React.SyntheticEvent;
  }) => {
    const { rowData, newValue, field, originalEvent: event } = e;

    switch (field) {
      case "quantity":
        if (isPositiveInteger(newValue)) rowData[field] = newValue;
        else event.preventDefault();
        break;
      case "unitRetailPrice":
        if (isPositiveInteger(newValue)) rowData[field] = newValue;
        else event.preventDefault();
        break;

      default:
        if (newValue.trim().length > 0) rowData[field] = newValue;
        else event.preventDefault();
        break;
    }
  };

  cellEditor = (options: ColumnEditorOptions) => {
    if (options.field === "unitRetailPrice") return priceEditor(options);
    if (options.field === "quantity") return numberEditor(options);
    else return textEditor(options);
  };

  onSubmit = (): void => {
    this.setState({ isModifiable: false });
    alert(
      "A form was submitted: \n" +
        this.state.date +
        "\n" +
        this.state.isModifiable +
        "\n" +
        JSON.stringify(DATA)
    );
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
            checked={this.state.isModifiable}
            onChange={() =>
              this.setState({ isModifiable: !this.state.isModifiable })
            }
          />

          <label htmlFor="date">Date</label>
          <Calendar
            id="date"
            disabled={!this.state.isModifiable}
            value={this.state.date}
            readOnlyInput
            onChange={(event: CalendarProps): void => {
              this.setState({ date: event.value });
            }}
          />

          <DataTable
            value={DATA}
            className="editable-cells-table"
            responsiveLayout="scroll"
          >
            {COLUMNS.map(({ field, header }) => {
              return (
                <Column
                  key={field}
                  field={field}
                  header={header}
                  style={{ width: "25%" }}
                  body={field === "unitRetailPrice" && priceBodyTemplate}
                  editor={(options) => this.cellEditor(options)}
                  onCellEditComplete={this.onCellEditComplete}
                />
              );
            })}
          </DataTable>
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
          {/* <Button type="submit" onClick={this.onSubmit} /> */}
        </form>
      </div>
    );
  }
}

export default ModifyPOPage;
