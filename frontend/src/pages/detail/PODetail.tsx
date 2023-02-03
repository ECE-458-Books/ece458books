import React from "react";
import { ToggleButton } from "primereact/togglebutton";
import { Calendar, CalendarProps } from "primereact/calendar";
import { Dropdown, DropdownProps } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { TableColumn } from "../../components/Table";
import { Column, ColumnEditorOptions } from "primereact/column";
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
  vendor: string;
  isModifiable: boolean;
  isConfirmationPopVisible: boolean;
}

interface Vendors {
  name: string;
  code: string;
}

const DATAVENDORS: Vendors[] = [
  { name: "New York", code: "NY" },
  { name: "Rome", code: "RM" },
  { name: "London", code: "LDN" },
  { name: "Istanbul", code: "IST" },
  { name: "Paris", code: "PRS" },
];

interface POPurchaseRow {
  books: string;
  quantity: number;
  unitRetailPrice: number;
}

const DATAPOROW: POPurchaseRow[] = [
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
      isModifiable: false,
      isConfirmationPopVisible: false,
    };
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
        this.state.vendor +
        "\n" +
        this.state.isModifiable +
        "\n" +
        JSON.stringify(DATAPOROW)
    );
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

          <label htmlFor="vendor">Vendor</label>
          <Dropdown
            value={this.state.vendor}
            placeholder={this.state.vendor}
            options={DATAVENDORS}
            disabled={!this.state.isModifiable}
            onChange={(event: DropdownProps): void => {
              this.setState({ vendor: event.value.name });
            }}
            optionLabel="name"
          />

          <DataTable
            value={DATAPOROW}
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
          {/* <Button disabled={!this.state.isModifiable} label="submit" type="submit" /> */}
        </form>
      </div>
    );
  }
}

export default ModifyPOPage;
