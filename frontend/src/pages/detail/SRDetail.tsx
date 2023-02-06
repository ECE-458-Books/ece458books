import React, { useState } from "react";
import { ToggleButton } from "primereact/togglebutton";
import { Calendar, CalendarProps } from "primereact/calendar";
import { DataTable } from "primereact/datatable";
import { Column, ColumnEditorOptions } from "primereact/column";
import { TableColumn } from "../../components/Table";
import ConfirmButton from "../../components/ConfirmButton";
import { v4 as uuid } from "uuid";
import {
  isPositiveInteger,
  numberEditor,
  priceBodyTemplate,
  priceEditor,
  textEditor,
} from "../../util/TableCellEditFuncs";
import { useLocation } from "react-router-dom";
import { Toolbar } from "primereact/toolbar";
import { Button } from "primereact/button";

export interface SRDetailState {
  date: any;
  data: SRSaleRow[];
  isAddPage: boolean;
  isModifiable: boolean;
  isConfirmationPopupVisible: boolean;
}

export interface SRSaleRow {
  rowID: string;
  books: string;
  quantity: number;
  retailPrice: number;
}

const COLUMNS: TableColumn[] = [
  { field: "rowID", header: "RowID", filterPlaceholder: "RowID" },
  { field: "books", header: "Books", filterPlaceholder: "Books" },
  { field: "quantity", header: "Quantity", filterPlaceholder: "Quantity" },
  {
    field: "retailPrice",
    header: "Unit Retail Price",
    filterPlaceholder: "Price",
  },
];

export default function SRDetail() {
  const emptyProduct = {
    rowID: uuid(),
    books: "",
    quantity: 1,
    retailPrice: 0,
  };

  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const detailState = (location.state! as SRDetailState) ?? {
    date: new Date(),
    data: [
      {
        rowID: uuid(),
        books: "",
        quantity: 1,
        retailPrice: 0,
      },
    ],
    isAddPage: true,
    isModifiable: true,
    isConfirmationPopupVisible: false,
  };
  const [date, setDate] = useState(detailState.date);
  const [data, setData] = useState(detailState.data);
  const [lineData, setLineData] = useState(emptyProduct);
  const [isAddPage, setisAddPage] = useState(detailState.isAddPage);
  const [isModifiable, setIsModifiable] = useState(detailState.isModifiable);
  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] = useState(
    detailState.isConfirmationPopupVisible
  );

  const openNew = () => {
    setLineData(emptyProduct);
    const _lineData = lineData;
    _lineData.rowID = uuid();
    setLineData(_lineData);
    const _data = [...data];
    _data.push({ ...lineData });
    setData(_data);
  };

  const deleteProduct = (rowData: any) => {
    const _data = data.filter((val) => val.rowID !== rowData.rowID);
    setData(_data);
  };

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
      case "retailPrice":
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
    if (isModifiable) {
      if (options.field === "retailPrice") return priceEditor(options);
      if (options.field === "quantity") return numberEditor(options);
      else return textEditor(options);
    }
  };

  const actionBodyTemplate = (rowData: any) => {
    return (
      <React.Fragment>
        <Button
          type="button"
          icon="pi pi-trash"
          className="p-button-rounded p-button-warning"
          onClick={() => deleteProduct(rowData)}
          disabled={!isModifiable}
        />
      </React.Fragment>
    );
  };

  const leftToolbarTemplate = () => {
    return (
      <React.Fragment>
        <Button
          type="button"
          label="New"
          icon="pi pi-plus"
          className="p-button-success mr-2"
          onClick={openNew}
          disabled={!isModifiable}
        />
      </React.Fragment>
    );
  };

  const onSubmit = (): void => {
    if (isAddPage) {
      console.log("Add page state submit");
    } else {
      setIsModifiable(false);
    }
  };

  return (
    <div>
      {isAddPage ? (
        <h1>Add Sales Reconciliation</h1>
      ) : (
        <h1>Modify Sales Reconciliation</h1>
      )}
      <form id="localForm">
        {!isAddPage && (
          <ToggleButton
            id="modifySRToggle"
            name="modifySRToggle"
            onLabel="Modifiable"
            offLabel="Modify"
            onIcon="pi pi-check"
            offIcon="pi pi-times"
            checked={isModifiable}
            disabled={isAddPage}
            onChange={() => setIsModifiable(!isModifiable)}
          />
        )}

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
        <Toolbar className="mb-4" left={leftToolbarTemplate} />
        <DataTable
          value={data}
          className="editable-cells-table"
          responsiveLayout="scroll"
          editMode="cell"
        >
          {COLUMNS.map(({ field, header }) => {
            return (
              <Column
                key={field}
                field={field}
                header={header}
                style={{ width: "25%" }}
                body={field === "retailPrice" && priceBodyTemplate}
                editor={(options) => cellEditor(options)}
                onCellEditComplete={onCellEditComplete}
                hidden={field === "rowID"}
              />
            );
          })}
          <Column
            body={actionBodyTemplate}
            exportable={false}
            style={{ minWidth: "8rem" }}
          ></Column>
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
