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
          className="p-button-rounded p-button-danger"
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
          className="p-button-info mr-2"
          onClick={openNew}
          disabled={!isModifiable}
        />
      </React.Fragment>
    );
  };

  const rightToolbarTemplate = () => {
    return (
      <React.Fragment>
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
          label={"Update"}
          className="p-button-success p-button-raised"
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
      <div className="grid flex justify-content-center">
        <link
          rel="stylesheet"
          href="https://unpkg.com/primeflex@3.1.2/primeflex.css"
        ></link>
        <div className="col-11">
          <div className="pt-2">
            {isAddPage ? (
              <h1 className="text-center text-900 color: var(--surface-800);">
                Add Sales Reconciliation
              </h1>
            ) : (
              <h1 className="text-center text-900 color: var(--surface-800);">
                Modify Sales Reconciliation
              </h1>
            )}
          </div>
          <form id="localForm">
            <div className="flex flex-row justify-content-center card-container col-12">
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
            </div>

            <div className="flex pb-2 flex-row justify-content-evenly card-container col-12">
              <div>
                <label htmlFor="date" className="pt-2 pr-2">
                  Date
                </label>
                <Calendar
                  id="date"
                  disabled={!isModifiable}
                  value={date}
                  readOnlyInput
                  onChange={(event: CalendarProps): void => {
                    setDate(event.value);
                  }}
                />
              </div>
            </div>

            <Toolbar
              className="mb-4"
              left={leftToolbarTemplate}
              right={rightToolbarTemplate}
            />
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

            {/* Maybe be needed in case the confrim button using the popup breaks */}
            {/* <Button type="submit" onClick={this.onSubmit} /> */}
          </form>
        </div>
      </div>
    </div>
  );
}
