import React, { useEffect, useRef, useState } from "react";
import { ToggleButton } from "primereact/togglebutton";
import { Calendar, CalendarProps } from "primereact/calendar";
import { DataTable } from "primereact/datatable";
import { createColumns, TableColumn } from "../../components/TableColumns";
import { Column, ColumnEditorOptions, ColumnEvent } from "primereact/column";
import ConfirmPopup from "../../components/ConfirmPopup";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { v4 as uuid } from "uuid";
import {
  isPositiveInteger,
  numberEditor,
  priceBodyTemplate,
  priceEditor,
} from "../../util/TableCellEditFuncs";
import { useLocation } from "react-router-dom";
import {
  AddPOReq,
  APIPOPurchaseRow,
  ModifyPOReq,
  PURCHASES_API,
} from "../../apis/PurchasesAPI";
import { toYYYYMMDDWithDash } from "../../util/DateOperations";
import { Toast } from "primereact/toast";
import { InputNumber } from "primereact/inputnumber";
import { FileUploadHandlerEvent } from "primereact/fileupload";
import { APIToInternalPurchasesCSVConversion } from "../../apis/Conversions";
import CSVUploader from "../../components/CSVFileUploader";
import VendorDropdown from "../../components/dropdowns/VendorDropdown";
import BooksDropdown, {
  BooksDropdownData,
} from "../../components/dropdowns/BookDropdown";

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
  bookISBN: string;
  bookTitle: string;
  quantity: number;
  unitWholesalePrice: number;
  errors?: { [key: string]: string }; // Only present on CSV import
}

// The books Interface lol no
export interface BooksList {
  id: number;
  title: string;
}

// Used for setting initial state
const emptyProduct: POPurchaseRow = {
  isNewRow: true,
  id: uuid(),
  bookId: 0,
  bookISBN: "",
  subtotal: 0,
  bookTitle: "",
  quantity: 1,
  unitWholesalePrice: 0,
};

export default function PODetail() {
  // -------- STATE --------
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
        bookISBN: "",
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

  // Need to check, but this can likely be deleted
  for (const purchase of detailState.purchases) {
    purchase.isNewRow = false;
  }

  const [bookMap, setBooksMap] = useState<Map<string, number>>(new Map());
  const [vendorMap, setVendorMap] = useState<Map<string, number>>(new Map());
  const [date, setDate] = useState(detailState.date);
  const [selectedVendorName, setSelectedVendorName] = useState<string>(
    detailState.vendorName
  );
  const [booksDropdownTitles, setBooksDropdownTitles] = useState<string[]>([]);
  const [purchases, setPurchases] = useState<POPurchaseRow[]>(
    detailState.purchases
  );
  const totalCost = detailState.totalCost;
  const purchaseOrderID = detailState.id;
  const [lineData, setLineData] = useState<POPurchaseRow>(emptyProduct);
  const isPOAddPage = detailState.isAddPage; // If false, this is an edit page
  const [isModifiable, setIsModifiable] = useState<boolean>(
    detailState.isModifiable
  );
  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] =
    useState<boolean>(detailState.isConfirmationPopupVisible);

  const COLUMNS: TableColumn[] = [
    {
      field: "bookTitle",
      header: "Book",
      cellEditor: (options: ColumnEditorOptions) =>
        booksDropDownEditor(options),
    },
    {
      field: "quantity",
      header: "Quantity",
      cellEditValidator: (event: ColumnEvent) =>
        isPositiveInteger(event.newValue),
      cellEditor: (options: ColumnEditorOptions) => numberEditor(options),
    },
    {
      field: "unitWholesalePrice",
      header: "Unit Wholesale Price ($)",
      cellEditValidator: (event: ColumnEvent) => event.newValue > 0,
      cellEditor: (options: ColumnEditorOptions) => priceEditor(options),
      customBody: (rowData: POPurchaseRow) =>
        priceBodyTemplate(rowData.unitWholesalePrice),
    },
    {
      field: "subtotal",
      header: "Subtotal ($)",
      customBody: (rowData: POPurchaseRow) =>
        priceBodyTemplate(rowData.subtotal),
    },
  ];

  // -------- METHODS --------

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

  // Handler for a CSV upload
  const csvUploadHandler = (event: FileUploadHandlerEvent) => {
    const csv = event.files[0];
    PURCHASES_API.purchaseOrderCSVImport({ file: csv })
      .then((response) => {
        const purchases = APIToInternalPurchasesCSVConversion(
          response.purchases
        );
        const nonBlockingErrors = response.errors;
        setPurchases(purchases);
      })
      .catch((error) => {
        showFailure(error.data.errors[0]);
      });
  };

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

    if (!date || !selectedVendorName) {
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
        vendor: vendorMap.get(selectedVendorName),
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
        vendor: vendorMap.get(selectedVendorName),
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
      <>
        <React.Fragment>
          <CSVUploader uploadHandler={csvUploadHandler} />
        </React.Fragment>
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
      </>
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

  // Get the data for the books dropdown
  useEffect(
    () =>
      BooksDropdownData({
        setBooksMap: setBooksMap,
        setBookTitlesList: setBooksDropdownTitles,
      }),
    []
  );

  const booksDropDownEditor = (options: ColumnEditorOptions) => (
    <BooksDropdown
      // This will always be used in a table cell, so we can disable the warning
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      setSelectedBook={options.editorCallback!}
      selectedBook={options.value}
      bookTitlesList={booksDropdownTitles}
    />
  );

  const vendorDropdown = (
    <VendorDropdown
      setVendorMap={setVendorMap}
      setSelectedVendor={setSelectedVendorName}
      selectedVendor={selectedVendorName}
      isModifiable={isModifiable}
    />
  );

  const columns = createColumns(COLUMNS);

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
                <>{vendorDropdown}</>
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
              {columns}
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
