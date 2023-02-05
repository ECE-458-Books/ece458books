import React, { useState } from "react";
import { ToggleButton } from "primereact/togglebutton";
import { Calendar, CalendarProps } from "primereact/calendar";
import { Dropdown, DropdownProps } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { TableColumn } from "../../components/Table";
import { Column, ColumnEditorOptions } from "primereact/column";
import ConfirmButton from "../../components/ConfirmButton";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { v4 as uuid } from "uuid";
import {
  isPositiveInteger,
  numberEditor,
  priceBodyTemplate,
  priceEditor,
  textEditor,
} from "../../util/TableCellEditFuncs";
import { useLocation } from "react-router-dom";

interface PODetailState {
  date: any;
  data: POPurchaseRow[];
  vendor: string;
  isModifiable: boolean;
  isConfirmationPopupVisible: boolean;
}

interface POPurchaseRow {
  rowID: string;
  books: string;
  quantity: number;
  unitRetailPrice: number;
}

// Below placeholders need to be removed
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

const columns: TableColumn[] = [
  { field: "rowID", header: "RowID", filterPlaceholder: "RowID" },
  { field: "books", header: "Books", filterPlaceholder: "Books" },
  { field: "quantity", header: "Quantity", filterPlaceholder: "Quantity" },
  {
    field: "unitRetailPrice",
    header: "Unit Retail Price",
    filterPlaceholder: "Price",
  },
];

export default function PODetail() {
  const emptyProduct = {
    rowID: uuid(),
    books: "",
    quantity: 1,
    unitRetailPrice: 0,
  };

  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const detailState = location.state! as PODetailState;
  const [date, setDate] = useState(detailState.date);
  const [vendor, setVendor] = useState(detailState.vendor);
  const [data, setData] = useState(detailState.data);
  const [lineData, setLineData] = useState(emptyProduct);
  const [isModifiable, setIsModifiable] = useState(detailState.isModifiable);
  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] = useState(
    detailState.isConfirmationPopupVisible
  );

  const deleteProduct = () => {
    const _data = data.filter((val) => val.rowID !== lineData.rowID);
    setData(_data);
    setLineData(emptyProduct);
  };

  const openNew = () => {
    setLineData(emptyProduct);
    const _data = [...data];
    _data.push({ ...lineData });
    setData(_data);
  };

  const confirmDeleteProduct = (product: any) => {
    setLineData(product);
    deleteProduct;
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

  const actionBodyTemplate = (rowData: any) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-warning"
          onClick={() => confirmDeleteProduct(rowData)}
        />
      </React.Fragment>
    );
  };

  const leftToolbarTemplate = () => {
    return (
      <React.Fragment>
        <Button
          label="New"
          icon="pi pi-plus"
          className="p-button-success mr-2"
          onClick={openNew}
        />
      </React.Fragment>
    );
  };

  const onSubmit = (): void => {
    setIsModifiable(false);
  };

  return (
    <div>
      <h1>Modify Purchase Order</h1>
      <form onSubmit={onSubmit}>
        <ToggleButton
          id="modifyPOToggle"
          name="modifyPOToggle"
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
          disabled={isModifiable}
          value={date}
          readOnlyInput
          onChange={(event: CalendarProps): void => {
            setDate(event.value);
          }}
        />

        <label htmlFor="vendor">Vendor</label>
        <Dropdown
          value={vendor}
          placeholder={vendor}
          options={DATAVENDORS}
          disabled={!isModifiable}
          onChange={(event: DropdownProps): void => {
            setVendor(event.value.name);
          }}
          optionLabel="name"
        />

        <Toolbar className="mb-4" left={leftToolbarTemplate} />

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
                body={field === "unitRetailPrice" && priceBodyTemplate}
                editor={(options) => cellEditor(options)}
                onCellEditComplete={onCellEditComplete}
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
          buttonClickFunc={() => setIsConfirmationPopupVisible(true)}
          disabled={!isModifiable}
          label={"Submit"}
        />

        {/* Maybe be needed in case the confrim button using the popup breaks */}
        {/* <Button disabled={!this.state.isModifiable} label="submit" type="submit" /> */}
      </form>
    </div>
  );
}
