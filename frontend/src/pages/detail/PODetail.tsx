import React, { useEffect, useState } from "react";
import { ToggleButton } from "primereact/togglebutton";
import { Calendar, CalendarProps } from "primereact/calendar";
import { Dropdown, DropdownProps } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { TableColumn } from "../../components/Table";
import { Column, ColumnEditorOptions, ColumnEvent } from "primereact/column";
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
  APIPOPurchaseRow,
  PURCHASES_API,
  APIPOCreate,
  APIPOModify,
} from "../../apis/PurchasesAPI";
import { VENDORS_API } from "../../apis/VendorsAPI";
import { Vendor } from "../list/VendorList";
import { BOOKS_API } from "../../apis/BooksAPI";
import { toYYYYMMDDWithDash } from "../../util/DateOperations";

export interface PODetailState {
  id: number;
  date: any;
  purchases: POPurchaseRow[];
  vendorName: string;
  vendorID: number;
  isAddPage: boolean;
  isModifiable: boolean;
  isConfirmationPopupVisible: boolean;
}

export interface POPurchaseRow {
  isNewRow: boolean; // true if the user added this row, false if it already existed
  id: string;
  book_id: number;
  book_title: string;
  quantity: number;
  unit_wholesale_price: number;
}

// The books Interface lol no
export interface BooksList {
  id: number;
  title: string;
}

export default function PODetail() {
  const emptyProduct = {
    isNewRow: true,
    id: uuid(),
    book_id: 0,
    book_title: "",
    quantity: 1,
    unit_wholesale_price: 0,
  };

  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const detailState = (location.state! as PODetailState) ?? {
    id: -1,
    date: new Date(),
    vendorName: "",
    vendorID: 0,
    purchases: [
      {
        isNewRow: true,
        id: uuid(),
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

  for (const purchase of detailState.purchases) {
    purchase.isNewRow = false;
  }
  const [bookMap, setBookMap] = useState<Map<string, number>>(new Map());

  const [date, setDate] = useState(detailState.date);
  const [vendorName, setVendorName] = useState(detailState.vendorName);
  const [vendorID, setVendorID] = useState(detailState.vendorID);
  const [purchases, setPurchases] = useState<POPurchaseRow[]>(
    detailState.purchases
  );
  const [purchaseOrderID, setPurchaseOrderID] = useState(detailState.id);
  const [lineData, setLineData] = useState(emptyProduct);
  const [vendorsData, setVendorsData] = useState<Vendor[]>();
  const [bookList, setBookTitlesList] = useState<string[]>();
  const [isPOAddPage, setisAddPage] = useState(detailState.isAddPage); // If false, this is an edit page
  const [isModifiable, setIsModifiable] = useState(detailState.isModifiable);
  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] = useState(
    detailState.isConfirmationPopupVisible
  );

  const columns: TableColumn[] = [
    {
      field: "book_id",
      header: "ID",
      filterPlaceholder: "ID",
    },
    {
      field: "book_title",
      header: "Books",
      filterPlaceholder: "Books",
      cellEditor: (options: ColumnEditorOptions) =>
        booksDropDownEditor(options),
    },
    {
      field: "quantity",
      header: "Quantity",
      filterPlaceholder: "Quantity",
      cellEditValidator: (event: ColumnEvent) =>
        isPositiveInteger(event.newValue),
      cellEditor: (options: ColumnEditorOptions) => numberEditor(options),
    },
    {
      field: "unit_wholesale_price",
      header: "Unit Retail Price ($)",
      filterPlaceholder: "Price",
      cellEditValidator: (event: ColumnEvent) => event.newValue > 0,
      cellEditor: (options: ColumnEditorOptions) => priceEditor(options),
    },
  ];

  const onCellEditComplete = (event: ColumnEvent) => {
    event.rowData[event.field] = event.newValue;
  };

  // Adds a row to the PO
  const addNewPurchase = () => {
    setLineData(emptyProduct);
    const _lineData = lineData;
    _lineData.id = uuid();
    setLineData(_lineData);
    const _data = [...purchases];
    _data.push({ ...lineData });
    setPurchases(_data);
  };

  // Deletes a row from the PO
  const deletePurchase = (rowData: POPurchaseRow) => {
    const _data = purchases.filter((val) => val.id !== rowData.id);
    setPurchases(_data);
  };

  // Populate the vendors/book list on page load
  useEffect(() => {
    VENDORS_API.getVendorsNOPaging().then((response) => {
      return setVendorsData(response.vendors);
    });

    BOOKS_API.getBooksNOPaging().then((response) => {
      const tempBookMap = new Map<string, number>();
      for (const book of response.books) {
        tempBookMap.set(book.title, book.id);
      }
      setBookMap(tempBookMap);
      setBookTitlesList(response.books.map((book) => book.title));
    });
  }, []);

  // On submission of the PO, we either add/edit depending on the page type
  const onSubmit = (): void => {
    if (isPOAddPage) {
      const apiPurchases = purchases.map((purchase) => {
        return {
          book_id: bookMap.get(purchase.book_title),
          quantity: purchase.quantity,
          unit_wholesale_price: purchase.unit_wholesale_price,
        };
      });

      const purchaseOrder = {
        date: toYYYYMMDDWithDash(date),
        vendor_id: vendorID,
        purchases: apiPurchases,
      } as APIPOCreate;

      PURCHASES_API.addPurchaseOrder(purchaseOrder);
    } else {
      // Otherwise, it is a modify page
      console.log(bookMap);
      const apiPurchases = purchases.map((purchase) => {
        console.log(purchase);
        console.log(bookMap.get(purchase.book_title));
        return {
          id: purchase.isNewRow ? undefined : purchase.id,
          book_id: purchase.isNewRow
            ? bookMap.get(purchase.book_title)
            : purchase.book_id,
          quantity: purchase.quantity,
          unit_wholesale_price: purchase.unit_wholesale_price,
        };
      });

      const purchaseOrder = {
        id: purchaseOrderID,
        date: toYYYYMMDDWithDash(date),
        vendor_id: vendorID,
        purchases: apiPurchases,
      } as APIPOModify;

      PURCHASES_API.modifyPurchaseOrder(purchaseOrder);
    }
  };

  // -------- TEMPLATES/VISUAL ELEMENTS --------

  const actionBodyTemplate = (rowData: any) => {
    return (
      <React.Fragment>
        <Button
          type="button"
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger"
          onClick={() => deletePurchase(rowData)}
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
          onClick={addNewPurchase}
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

  const booksDropDownEditor = (options: ColumnEditorOptions) => {
    return (
      <Dropdown
        value={options.value}
        options={bookList}
        filter
        appendTo={"self"}
        placeholder="Select a Book"
        onChange={(e) => {
          options.editorCallback?.(e.target.value);
        }}
        showClear
        virtualScrollerOptions={{ itemSize: 35 }}
      />
    );
  };

  const tableColumns = columns.map((col) => {
    return (
      <Column
        key={col.field}
        field={col.field}
        header={col.header}
        style={{ width: "25%" }}
        body={
          col.field === "unit_wholesale_price" && priceBodyTemplateWholesale
        }
        editor={col.cellEditor}
        cellEditValidator={col.cellEditValidator}
        onCellEditComplete={onCellEditComplete}
      />
    );
  });

  return (
    <div>
      <div className="grid flex justify-content-center">
        <link
          rel="stylesheet"
          href="https://unpkg.com/primeflex@3.1.2/primeflex.css"
        ></link>
        <div className="col-11">
          <div className="pt-2">
            {isPOAddPage ? (
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
              {!isPOAddPage && (
                <ToggleButton
                  id="modifyPOToggle"
                  name="modifyPOToggle"
                  onLabel="Modifiable"
                  offLabel="Modify"
                  onIcon="pi pi-check"
                  offIcon="pi pi-times"
                  disabled={isPOAddPage}
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
              value={purchases}
              className="editable-cells-table"
              responsiveLayout="scroll"
              editMode="cell"
              footer="b"
            >
              {tableColumns}
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
