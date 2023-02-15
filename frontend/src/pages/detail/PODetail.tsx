import React, { useEffect, useRef, useState } from "react";
import { ToggleButton } from "primereact/togglebutton";
import { Calendar, CalendarProps } from "primereact/calendar";
import { Dropdown, DropdownProps } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { TableColumn } from "../../components/Table";
import { Column, ColumnEditorOptions, ColumnEvent } from "primereact/column";
import ConfirmPopup from "../../components/ConfirmPopup";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { v4 as uuid } from "uuid";
import {
  isPositiveInteger,
  numberEditor,
  priceBodyTemplateSubtotal,
  priceBodyTemplateWholesale,
  priceEditor,
} from "../../util/TableCellEditFuncs";
import { useLocation } from "react-router-dom";
import {
  AddPOReq,
  APIPOPurchaseRow,
  ModifyPOReq,
  PURCHASES_API,
} from "../../apis/PurchasesAPI";
import { VENDORS_API } from "../../apis/VendorsAPI";
import { BOOKS_API } from "../../apis/BooksAPI";
import { toYYYYMMDDWithDash } from "../../util/DateOperations";
import { Toast } from "primereact/toast";
import { InputNumber } from "primereact/inputnumber";

export interface PODetailState {
  id: number;
  date: any;
  purchases: POPurchaseRow[];
  totalCost: number;
  vendorName: string;
  vendorID: number;
  isAddPage: boolean;
  isModifiable: boolean;
  isConfirmationPopupVisible: boolean;
}

export interface POPurchaseRow {
  isNewRow: boolean; // true if the user added this row, false if it already existed
  id: string;
  subtotal: number;
  bookId: number;
  bookTitle: string;
  quantity: number;
  unitWholesalePrice: number;
}

// The books Interface lol no
export interface BooksList {
  id: number;
  title: string;
}

export default function PODetail() {
  const emptyProduct: POPurchaseRow = {
    isNewRow: true,
    id: uuid(),
    bookId: 0,
    subtotal: 0,
    bookTitle: "",
    quantity: 1,
    unitWholesalePrice: 0,
  };

  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const detailState = (location.state! as PODetailState) ?? {
    id: -1,
    date: new Date(),
    vendorName: "",
    vendorID: 0,
    totalCost: 0,
    purchases: [
      {
        isNewRow: true,
        id: uuid(),
        bookTitle: "",
        subtotal: 0,
        bookId: 0,
        quantity: 1,
        unitWholesalePrice: 0,
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
  const [vendorMap, setVendorMap] = useState<Map<string, number>>(new Map());
  const [date, setDate] = useState(detailState.date);
  const [vendorName, setVendorName] = useState<string>(detailState.vendorName);
  const [purchases, setPurchases] = useState<POPurchaseRow[]>(
    detailState.purchases
  );
  const totalCost = detailState.totalCost;
  const purchaseOrderID = detailState.id;
  const [lineData, setLineData] = useState<POPurchaseRow>(emptyProduct);
  const [vendorNamesList, setVendorNamesList] = useState<string[]>();
  const [bookTitlesList, setBookTitlesList] = useState<string[]>();
  const isPOAddPage = detailState.isAddPage; // If false, this is an edit page
  const [isModifiable, setIsModifiable] = useState<boolean>(
    detailState.isModifiable
  );
  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] =
    useState<boolean>(detailState.isConfirmationPopupVisible);

  const columns: TableColumn[] = [
    {
      field: "bookId",
      header: "ID",
      filterPlaceholder: "ID",
      hidden: true,
    },
    {
      field: "bookTitle",
      header: "Book",
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
      field: "unitWholesalePrice",
      header: "Unit Wholesale Price ($)",
      filterPlaceholder: "Price",
      cellEditValidator: (event: ColumnEvent) => event.newValue > 0,
      cellEditor: (options: ColumnEditorOptions) => priceEditor(options),
    },
    {
      field: "subtotal",
      header: "Subtotal ($)",
      filterPlaceholder: "Subtotal",
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
      console.log(response);
      const tempVendorMap = new Map<string, number>();
      for (const vendor of response) {
        tempVendorMap.set(vendor.name, vendor.id);
      }
      setVendorMap(tempVendorMap);
      setVendorNamesList(response.map((vendor) => vendor.name));
      //return setVendorsData(response.vendors);
    });

    BOOKS_API.getBooksNOPaging().then((response) => {
      const tempBookMap = new Map<string, number>();
      for (const book of response) {
        tempBookMap.set(book.title, book.id);
      }
      setBookMap(tempBookMap);
      setBookTitlesList(response.map((book) => book.title));
    });
  }, []);

  const validateSubmission = (po: POPurchaseRow[]) => {
    for (const purchase of po) {
      if (
        !purchase.bookTitle ||
        !(purchase.unitWholesalePrice >= 0) ||
        !purchase.quantity
      ) {
        showFailure("All fields are required");
        return false;
      }
    }

    if (!date || !vendorName) {
      showFailure("All fields are required");
      return false;
    }

    return true;
  };

  // On submission of the PO, we either add/edit depending on the page type
  const onSubmit = (): void => {
    if (!validateSubmission(purchases)) {
      return;
    }

    if (isPOAddPage) {
      // Create API Format
      const apiPurchases = purchases.map((purchase) => {
        return {
          book: bookMap.get(purchase.bookTitle),
          quantity: purchase.quantity,
          unit_wholesale_price: purchase.unitWholesalePrice,
        } as APIPOPurchaseRow;
      });

      const purchaseOrder = {
        date: toYYYYMMDDWithDash(date),
        vendor: vendorMap.get(vendorName),
        purchases: apiPurchases,
      } as AddPOReq;

      PURCHASES_API.addPurchaseOrder(purchaseOrder)
        .then(() => showSuccess("Purchase order added successfully"))
        .catch(() => showFailure("Could not add purchase order"));
    } else {
      // Otherwise, it is a modify page
      const apiPurchases = purchases.map((purchase) => {
        return {
          id: purchase.isNewRow ? undefined : purchase.id,
          book: purchase.isNewRow
            ? bookMap.get(purchase.bookTitle)
            : purchase.bookId,
          quantity: purchase.quantity,
          unit_wholesale_price: purchase.unitWholesalePrice,
        } as APIPOPurchaseRow;
      });

      const purchaseOrder = {
        id: purchaseOrderID,
        date: toYYYYMMDDWithDash(date),
        vendor: vendorMap.get(vendorName),
        purchases: apiPurchases,
      } as ModifyPOReq;

      PURCHASES_API.modifyPurchaseOrder(purchaseOrder)
        .then(() => showSuccess("Purchase order modified successfully"))
        .catch(() => showFailure("Could not modify purchase order"));
    }
  };

  // -------- TEMPLATES/VISUAL ELEMENTS --------

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  const showSuccess = (message: string) => {
    toast.current?.show({ severity: "success", summary: message });
  };

  const showFailure = (message: string) => {
    toast.current?.show({
      severity: "error",
      summary: message,
    });
  };

  const actionBodyTemplate = (rowData: POPurchaseRow) => {
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
          label="Add Book"
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
        <ConfirmPopup
          isVisible={isConfirmationPopupVisible}
          hideFunc={() => setIsConfirmationPopupVisible(false)}
          acceptFunc={onSubmit}
          rejectFunc={() => {
            console.log("reject");
          }}
          buttonClickFunc={() => setIsConfirmationPopupVisible(true)}
          disabled={!isModifiable}
          label={"Submit"}
          className="p-button-success p-button-raised"
        />
      </React.Fragment>
    );
  };

  const booksDropDownEditor = (options: ColumnEditorOptions) => {
    return (
      <Dropdown
        value={options.value}
        options={bookTitlesList}
        filter
        appendTo={"self"}
        placeholder="Select a Book"
        onChange={(e) => {
          options.editorCallback?.(e.target.value);
        }}
        showClear
        virtualScrollerOptions={{ itemSize: 35 }}
        style={{ position: "absolute", zIndex: 9999 }}
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
          (col.field === "unit_wholesale_price" &&
            priceBodyTemplateWholesale) ||
          (col.field === "subtotal" && priceBodyTemplateSubtotal)
        }
        editor={col.cellEditor}
        cellEditValidator={col.cellEditValidator}
        onCellEditComplete={onCellEditComplete}
        hidden={col.hidden}
      />
    );
  });

  return (
    <div>
      <Toast ref={toast} />
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
                  onLabel="Editable"
                  offLabel="Edit"
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
                  className="p-component p-text-secondary pr-2 pt-2 text-teal-900"
                  htmlFor="totalcost"
                >
                  Total Cost ($):
                </label>
                <InputNumber
                  id="totalcost2"
                  className="w-6"
                  minFractionDigits={2}
                  useGrouping={false}
                  name="totalcost2"
                  value={totalCost ?? 0}
                  disabled={true}
                />
              </div>
              <div>
                <label
                  htmlFor="date"
                  className="pt-2 pr-2 p-component text-teal-900 p-text-secondary"
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
                  className="pt-2 pr-2 p-component text-teal-900 p-text-secondary"
                >
                  Vendor
                </label>
                <Dropdown
                  value={vendorName}
                  options={vendorNamesList}
                  placeholder="Select a Vendor"
                  //optionLabel="name"
                  filter
                  disabled={!isModifiable}
                  onChange={(event: DropdownProps): void => {
                    setVendorName(event.value);
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
              showGridlines
              value={purchases}
              className="editable-cells-table"
              responsiveLayout="scroll"
              editMode="cell"
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
