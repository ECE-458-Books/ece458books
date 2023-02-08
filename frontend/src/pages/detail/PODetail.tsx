import React, { useEffect, useState } from "react";
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
  priceBodyTemplateWholesale,
  priceEditor,
  textEditor,
} from "../../util/TableCellEditFuncs";
import { useLocation } from "react-router-dom";
import {
  GetPurchaseResp,
  POPurchRowSubmit,
  PURCHASES_API,
} from "../../apis/PurchasesAPI";
import { VENDORS_API } from "../../apis/VendorsAPI";
import { Vendor } from "../list/VendorList";
import { BOOKS_API } from "../../apis/BooksAPI";

export interface PODetailState {
  id: number;
  date: any;
  data: POPurchaseRow[];
  vendorName: string;
  vendorID: number;
  isAddPage: boolean;
  isModifiable: boolean;
  isConfirmationPopupVisible: boolean;
}

export interface POPurchaseRow {
  rowID: string;
  book_id: number;
  book_title: string;
  quantity: number;
  unit_wholesale_price: number;
}

// Below placeholders need to be removed
interface Vendors {
  name: string;
  id: number;
}

// The books Interface lol no
export interface BooksList {
  id: number;
  name: string;
}

const columns: TableColumn[] = [
  { field: "book_id", header: "ID", filterPlaceholder: "ID" },
  { field: "book_title", header: "Books", filterPlaceholder: "Books" },
  { field: "quantity", header: "Quantity", filterPlaceholder: "Quantity" },
  {
    field: "unit_wholesale_price",
    header: "Unit Retail Price ($)",
    filterPlaceholder: "Price",
  },
];

export default function PODetail() {
  const emptyProduct = {
    rowID: uuid(),
    book_id: 0,
    book_title: "",
    quantity: 1,
    unit_wholesale_price: 0,
  };

  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const detailState = (location.state! as PODetailState) ?? {
    date: new Date(),
    vendorName: "",
    vendorID: 0,
    data: [
      {
        rowID: uuid(),
        book_title: "",
        book_id: 0,
        quantity: 1,
        unit_wholesale_price: 0,
      },
    ],
    isAddPage: true,
    isModifiable: true,
    isConfirmationPopupVisible: false,
  };
  const [date, setDate] = useState(detailState.date);
  const [vendorName, setVendorName] = useState(detailState.vendorName);
  const [vendorID, setVendorID] = useState(detailState.vendorID);
  const [data, setData] = useState(detailState.data);
  const [id, setId] = useState(detailState.id);
  const [lineData, setLineData] = useState(emptyProduct);
  const [vendorsData, setVendorsData] = useState<Vendor[]>();
  const [booksData, setBooksData] = useState<BooksList[]>();
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
      case "book_id":
        break;
      case "book_title":
        rowData[field] = newValue.name;
        rowData["book_id"] = newValue.id;
        break;
      case "quantity":
        if (isPositiveInteger(newValue)) rowData[field] = newValue;
        else event.preventDefault();
        break;
      case "unit_wholesale_price":
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
      if (options.field === "book_title") return dropDownEditor(options);
      if (options.field === "unit_wholesale_price") return priceEditor(options);
      if (options.field === "quantity") return numberEditor(options);
      else return textEditor(options);
    }
  };

  const dropDownEditor = (options: ColumnEditorOptions) => {
    return (
      <Dropdown
        value={options.value}
        options={booksData}
        filter
        appendTo={"self"}
        placeholder="Select a Book"
        optionLabel="name"
        className="z-5"
        onChange={(e) => {
          options.editorCallback?.(e.target.value);
        }}
        showClear
        virtualScrollerOptions={{ itemSize: 35 }}
      />
    );
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
          className="p-button-info mr-2"
          icon="pi pi-plus"
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
          buttonClickFunc={() => setIsConfirmationPopupVisible(true)}
          disabled={!isModifiable}
          label={"Update"}
          className="p-button-success p-button-raised"
        />
      </React.Fragment>
    );
  };

  // When any of the list of params are changed, useEffect is called to hit the API endpoint
  useEffect(() => callAPI(), [id]);

  // Calls the Vendors API
  const callAPI = () => {
    if (!isAddPage) {
      PURCHASES_API.getPurchase(id).then((response) => {
        return onDATAPIResponse(response);
      });
    }

    VENDORS_API.getVendorsNOPaging().then((response) => {
      console.log(response.vendors);
      return setVendorsData(response.vendors);
    });

    BOOKS_API.getBooksNOPaging().then((response) => {
      console.log(response.books);
      return setBooksData(response.books);
    });
  };

  // Set state when response to API call is received
  const onDATAPIResponse = (response: GetPurchaseResp) => {
    const _data = response.purchase.map((po: POPurchaseRow) => {
      return {
        rowID: uuid(),
        book_id: po.book_id,
        book_title: po.book_title,
        quantity: po.quantity,
        unit_wholesale_price: po.unit_wholesale_price,
      };
    });
    setData(_data);
  };

  const onSubmit = (): void => {
    if (isAddPage) {
      const _purchasesCorrected: POPurchRowSubmit[] = data.map(
        (purchase: POPurchaseRow) => {
          return {
            book_id: purchase.book_id,
            quantity: purchase.quantity,
            unit_wholesale_price: purchase.unit_wholesale_price,
          };
        }
      );
      console.log("Add Page is submitted");
      const _POs = {
        date:
          date.getFullYear() +
          "-" +
          (date.getMonth() + 1) +
          "-" +
          date.getDate(),
        vendor_id: vendorID,
        purchases: _purchasesCorrected,
      };
      //console.log(date.toString());
      console.log(_POs);

      PURCHASES_API.addPurchaseOrder(_POs);
      //console.log(vendorID);
      //console.log(vendorName);
      //console.log(data);
      //PURCHASES_API.addPurchaseOrder("");
    } else {
      setIsModifiable(false);
      console.log(date);
      console.log(vendorID);
      console.log(vendorName);
      console.log(data);
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
              <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
                Add Purchase Order
              </h1>
            ) : (
              <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
                Modify Purchase Order
              </h1>
            )}
          </div>
          <form onSubmit={onSubmit}>
            <div className="flex flex-row justify-content-center card-container col-12">
              {!isAddPage && (
                <ToggleButton
                  id="modifyPOToggle"
                  name="modifyPOToggle"
                  onLabel="Modifiable"
                  offLabel="Modify"
                  onIcon="pi pi-check"
                  offIcon="pi pi-times"
                  disabled={isAddPage}
                  checked={isModifiable}
                  onChange={() => setIsModifiable(!isModifiable)}
                />
              )}
            </div>

            <div className="flex pb-2 flex-row justify-content-evenly card-container col-12">
              <div>
                <label
                  htmlFor="date"
                  className="pt-2 pr-2 p-component text-teal-800 p-text-secondary"
                >
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

              <div>
                <label
                  htmlFor="vendor"
                  className="pt-2 pr-2 p-component text-teal-800 p-text-secondary"
                >
                  Vendor
                </label>
                <Dropdown
                  value={{ name: vendorName, id: vendorID }}
                  options={vendorsData}
                  placeholder="Select a Vendor"
                  optionLabel="name"
                  filter
                  disabled={!isModifiable}
                  onChange={(event: DropdownProps): void => {
                    setVendorName(event.value.name);
                    setVendorID(event.value.id);
                  }}
                  virtualScrollerOptions={{ itemSize: 35 }}
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
              {columns.map(({ field, header }) => {
                return (
                  <Column
                    key={field}
                    field={field}
                    header={header}
                    style={{ width: "25%" }}
                    body={
                      field === "unit_wholesale_price" &&
                      priceBodyTemplateWholesale
                    }
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

            {/* Maybe be needed in case the confrim button using the popup breaks */}
            {/* <Button disabled={!this.state.isModifiable} label="submit" type="submit" /> */}
          </form>
        </div>
      </div>
    </div>
  );
}
