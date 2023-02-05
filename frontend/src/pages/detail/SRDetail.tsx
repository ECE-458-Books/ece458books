import React, { useState } from "react";
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
import { useLocation } from "react-router-dom";

interface SRDetailState {
  date: any;
  data: SRSaleRow[];
  isModifiable: boolean;
  isConfirmationPopupVisible: boolean;
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

export default function SRDetail() {
  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const detailState = location.state! as SRDetailState;
  const [date, setDate] = useState(detailState.date);
  const [data, setData] = useState(detailState.data);
  const [isModifiable, setIsModifiable] = useState(detailState.isModifiable);
  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] = useState(
    detailState.isConfirmationPopupVisible
  );

  const onCellEditComplete = (e: {
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

  const cellEditor = (options: ColumnEditorOptions) => {
    if (options.field === "unitRetailPrice") return priceEditor(options);
    if (options.field === "quantity") return numberEditor(options);
    else return textEditor(options);
  };

  const onSubmit = (): void => {
    setIsModifiable(false);
    console.log(data);
  };

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
          checked={isModifiable}
          onChange={() => setIsModifiable(!isModifiable)}
        />

        <label htmlFor="date">Date</label>
        <Calendar
          id="date"
          disabled={!isModifiable}
          value={date}
          readOnlyInput
          onChange={(event: CalendarProps): void => {
            setDate(event.value);
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
                editor={(options) => cellEditor(options)}
                onCellEditComplete={onCellEditComplete}
              />
            );
          })}
        </DataTable>
        <ConfirmButton
          isVisible={isConfirmationPopupVisible}
          hideFunc={() => setIsConfirmationPopupVisible(false)}
          acceptFunc={onSubmit}
          rejectFunc={() => {
            console.log("reject");
          }}
          buttonClickFunc={() => {
            setIsConfirmationPopupVisible(true);
          }}
          disabled={!isModifiable}
          label={"Submit"}
        />

        {/* Maybe be needed in case the confrim button using the popup breaks */}
        {/* <Button type="submit" onClick={this.onSubmit} /> */}
      </form>
    </div>
  );
}
