import React, { useEffect, useRef, useState } from "react";
import { ToggleButton } from "primereact/togglebutton";
import { Calendar, CalendarChangeEvent } from "primereact/calendar";
import { DataTable } from "primereact/datatable";
import { createColumns, TableColumn } from "../../components/TableColumns";
import { Column } from "primereact/column";
import ConfirmPopup from "../../components/popups/ConfirmPopup";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { v4 as uuid } from "uuid";
import {
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
import { internalToExternalDate } from "../../util/DateOperations";
import { Toast } from "primereact/toast";
import { InputNumber } from "primereact/inputnumber";
import { FileUploadHandlerEvent } from "primereact/fileupload";
import {
  APIToInternalPOConversion,
  APIToInternalPurchasesCSVConversion,
} from "../../apis/Conversions";
import CSVUploader from "../../components/uploaders/CSVFileUploader";
import VendorDropdown from "../../components/dropdowns/VendorDropdown";
import BooksDropdown, {
  BooksDropdownData,
} from "../../components/dropdowns/BookDropdown";
import {
  showFailure,
  showFailuresMapper,
  showSuccess,
  showWarningsMapper,
} from "../../components/Toast";
import {
  CSVImport200Errors,
  CSVImport400Errors,
  errorCellBody,
} from "./errors/CSVImportErrors";
import { Book } from "../list/BookList";
import { useImmer } from "use-immer";

export interface PODetailState {
  id: number;
  isAddPage: boolean;
  isModifiable: boolean;
}

export interface POPurchaseRow {
  isNewRow: boolean; // true if the user added this row, false if it already existed
  id: string;
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
const emptyPurchase: POPurchaseRow = {
  isNewRow: true,
  id: uuid(),
  bookId: 0,
  bookISBN: "",
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
    isAddPage: true,
    isModifiable: true,
  };

  // From detailState
  const purchaseOrderID = detailState.id;
  const isPOAddPage = detailState.isAddPage; // If false, this is an edit page
  const [isModifiable, setIsModifiable] = useState<boolean>(
    detailState.isModifiable
  );

  // For Dropdown Menus
  const [bookMap, setBooksMap] = useState<Map<string, Book>>(new Map());
  const [vendorMap, setVendorMap] = useState<Map<string, number>>(new Map());
  const [booksDropdownTitles, setBooksDropdownTitles] = useState<string[]>([]);

  // The rest of the data
  const [date, setDate] = useState<Date>(new Date());
  const [selectedVendorName, setSelectedVendorName] = useState<string>("");
  // useImmer is used to set state for nested data in a simplified format
  const [purchases, setPurchases] = useImmer<POPurchaseRow[]>([]);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [lineData, setLineData] = useState<POPurchaseRow>(emptyPurchase);
  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] =
    useState<boolean>(false);
  const [hasUploadedCSV, setHasUploadedCSV] = useState<boolean>(false);

  const findPurchaseById = (id: string, purchases: POPurchaseRow[]) => {
    return purchases.find((purchase) => purchase.id === id);
  };

  // Load the PO data on page load
  useEffect(() => {
    if (!isPOAddPage) {
      PURCHASES_API.getPurchaseOrderDetail({ id: purchaseOrderID })
        .then((response) => {
          const purchaseOrder = APIToInternalPOConversion(response);
          setDate(purchaseOrder.date);
          setSelectedVendorName(purchaseOrder.vendorName);
          setPurchases(purchaseOrder.purchases);
          setTotalCost(purchaseOrder.totalCost);
        })
        .catch(() => showFailure(toast, "Could not fetch purchase order data"));
    }
  }, []);

  const COLUMNS: TableColumn[] = [
    {
      field: "errors",
      header: "Errors",
      hidden: !hasUploadedCSV,
      customBody: (rowData: POPurchaseRow) => errorCellBody(rowData.errors),
    },
    {
      field: "bookTitle",
      header: "Book",
      customBody: (rowData: POPurchaseRow) =>
        booksDropDownEditor(rowData.bookTitle, (newValue) => {
          setPurchases((draft) => {
            const purchase = findPurchaseById(rowData.id, draft);
            purchase!.bookTitle = newValue;
          });
        }),
    },
    {
      field: "quantity",
      header: "Quantity",
      customBody: (rowData: POPurchaseRow) =>
        numberEditor(rowData.quantity, (newValue) => {
          setPurchases((draft) => {
            const purchase = findPurchaseById(rowData.id, draft);
            purchase!.quantity = newValue;
          });
        }),
    },
    {
      field: "unitWholesalePrice",
      header: "Unit Wholesale Price ($)",
      customBody: (rowData: POPurchaseRow) =>
        priceEditor(rowData.unitWholesalePrice, (newValue) => {
          setPurchases((draft) => {
            const purchase = findPurchaseById(rowData.id, draft);
            purchase!.unitWholesalePrice = newValue;
          });
        }),
    },
    {
      field: "subtotal",
      header: "Subtotal ($)",
      customBody: (rowData: POPurchaseRow) =>
        priceBodyTemplate(rowData.unitWholesalePrice * rowData.quantity),
    },
  ];

  // -------- METHODS --------

  // Adds a row to the PO
  const addNewPurchase = () => {
    setLineData(emptyPurchase);
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
        setPurchases(purchases);
        setHasUploadedCSV(true);

        // Show nonblocking errors (warnings)
        const nonBlockingErrors = response.errors;
        showWarningsMapper(toast, nonBlockingErrors, CSVImport200Errors);
      })
      .catch((error) => {
        showFailuresMapper(toast, error.data.errors, CSVImport400Errors);
      });
  };

  const validateSubmission = () => {
    for (const purchase of purchases) {
      if (
        !purchase.bookTitle ||
        !(purchase.unitWholesalePrice >= 0) ||
        !purchase.quantity
      ) {
        showFailure(
          toast,
          "Book, wholesale, and quantity are required for all line items"
        );
        return false;
      }
    }

    if (!date || !selectedVendorName) {
      showFailure(toast, "Date is a required field");
      return false;
    }

    return true;
  };

  // On submission of the PO, we either add/edit depending on the page type
  const onSubmit = (): void => {
    if (!validateSubmission()) {
      return;
    }

    if (isPOAddPage) {
      callAddPOAPI();
    } else {
      callModifyPOAPI();
    }
  };

  // Add the purchase order
  function callAddPOAPI() {
    const apiPurchases = purchases.map((purchase) => {
      return {
        book: bookMap.get(purchase.bookTitle)?.id,
        quantity: purchase.quantity,
        unit_wholesale_price: purchase.unitWholesalePrice,
      } as APIPOPurchaseRow;
    });

    const purchaseOrder = {
      date: internalToExternalDate(date),
      vendor: vendorMap.get(selectedVendorName),
      purchases: apiPurchases,
    } as AddPOReq;

    PURCHASES_API.addPurchaseOrder(purchaseOrder)
      .then(() => showSuccess(toast, "Purchase order added successfully"))
      .catch(() => showFailure(toast, "Could not add purchase order"));
  }

  // Modify the purchase order
  function callModifyPOAPI() {
    const apiPurchases = purchases.map((purchase) => {
      return {
        id: purchase.isNewRow ? undefined : purchase.id,
        quantity: purchase.quantity,
        // If the book has been deleted, will have to use the id in the row
        book: bookMap.get(purchase.bookTitle)?.id ?? purchase.bookId,
        unit_wholesale_price: purchase.unitWholesalePrice,
      } as APIPOPurchaseRow;
    });

    const purchaseOrder = {
      id: purchaseOrderID,
      date: internalToExternalDate(date),
      vendor: vendorMap.get(selectedVendorName),
      purchases: apiPurchases,
    } as ModifyPOReq;

    PURCHASES_API.modifyPurchaseOrder(purchaseOrder)
      .then(() => showSuccess(toast, "Purchase order modified successfully"))
      .catch(() => showFailure(toast, "Could not modify purchase order"));
  }

  // -------- TEMPLATES/VISUAL ELEMENTS --------

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

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

  const booksDropDownEditor = (
    value: string,
    onChange: (newValue: string) => void
  ) => (
    <BooksDropdown
      // This will always be used in a table cell, so we can disable the warning
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      setSelectedBook={onChange}
      selectedBook={value}
      bookTitlesList={booksDropdownTitles}
      placeholder={value}
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
                  onChange={(event: CalendarChangeEvent): void => {
                    setDate(event.value as Date);
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
