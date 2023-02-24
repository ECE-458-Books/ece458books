import { Calendar, CalendarChangeEvent } from "primereact/calendar";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { ToggleButton } from "primereact/togglebutton";
import { Toolbar } from "primereact/toolbar";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { v4 as uuid } from "uuid";
import { TableColumn, createColumns } from "../../components/TableColumns";
import {
  numberEditor,
  priceBodyTemplate,
  priceEditor,
} from "../../util/TableCellEditFuncs";
import { errorCellBody } from "./errors/CSVImportErrors";
import BooksDropdown, {
  BooksDropdownData,
} from "../../components/dropdowns/BookDropdown";
import VendorDropdown from "../../components/dropdowns/VendorDropdown";
import React from "react";
import ConfirmPopup from "../../components/popups/ConfirmPopup";
import { Button } from "primereact/button";
import { showFailure, showSuccess } from "../../components/Toast";
import {
  APIBBSaleRow,
  AddBBReq,
  BUYBACK_API,
  ModifyBBReq,
} from "../../apis/BuyBackAPI";
import { internalToExternalDate } from "../../util/DateOperations";

export interface BBDetailState {
  id: number;
  isAddPage: boolean;
  isModifiable: boolean;
}

export interface BBSaleRow {
  isNewRow: boolean;
  id: string;
  subtotal: number;
  bookId: number;
  bookTitle: string;
  quantity: number;
  unitBuyBackPrice: number;
  errors?: { [key: string]: string };
}

// Used for setting initial state
const emptySale: BBSaleRow = {
  isNewRow: true,
  id: uuid(),
  bookId: 0,
  subtotal: 0,
  bookTitle: "",
  quantity: 1,
  unitBuyBackPrice: 0,
};

export default function BBDetail() {
  // -------- STATE --------
  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const detailState = (location.state! as BBDetailState) ?? {
    id: -1,
    isAddPage: true,
    isModifiable: true,
  };

  // From detailState
  const buyBackID = detailState.id;
  const isBBAddPage = detailState.isAddPage; // If false, this is an edit page
  const [isModifiable, setIsModifiable] = useState<boolean>(
    detailState.isModifiable
  );

  // For Dropdown Menus
  const [booksMap, setBooksMap] = useState<Map<string, number>>(new Map());
  const [vendorMap, setVendorMap] = useState<Map<string, number>>(new Map());
  const [booksDropdownTitles, setBooksDropdownTitles] = useState<string[]>([]);

  // The rest of the data
  const [date, setDate] = useState<Date>(new Date());
  const [selectedVendorName, setSelectedVendorName] = useState<string>("");
  const [sales, setSales] = useState<BBSaleRow[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [lineData, setLineData] = useState<BBSaleRow>(emptySale);
  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] =
    useState<boolean>(false);
  const [bookDropdownRefreshKey, setBookDropdownRefreshKey] =
    useState<number>(0);

  const COLUMNS: TableColumn[] = [
    {
      field: "errors",
      header: "Errors",
      customBody: (rowData: BBSaleRow) => errorCellBody(rowData.errors),
    },
    {
      field: "bookTitle",
      header: "Book",
      customBody: (rowData: BBSaleRow) =>
        booksDropDownEditor(rowData.bookTitle, (newValue) => {
          rowData.bookTitle = newValue;
          setBookDropdownRefreshKey(Math.random());
        }),
    },
    {
      field: "quantity",
      header: "Quantity",
      customBody: (rowData: BBSaleRow) =>
        numberEditor(
          rowData.quantity,
          (newValue) => (rowData.quantity = newValue)
        ),
    },
    {
      field: "unitBuyBackPrice",
      header: "Unit Buy Back Price ($)",
      customBody: (rowData: BBSaleRow) =>
        priceEditor(
          rowData.unitBuyBackPrice,
          (newValue) => (rowData.unitBuyBackPrice = newValue)
        ),
    },
    {
      field: "subtotal",
      header: "Subtotal ($)",
      customBody: (rowData: BBSaleRow) => priceBodyTemplate(rowData.subtotal),
    },
  ];

  const addNewSale = () => {
    setLineData(emptySale);
    const _lineData = lineData;
    _lineData.id = uuid();
    setLineData(_lineData);
    const _data = [...sales];
    _data.push({ ...lineData });
    setSales(_data);
  };

  const deleteSale = (rowData: BBSaleRow) => {
    const _data = sales.filter((val) => val.id !== rowData.id);
    setSales(_data);
  };

  // Validate submission before making API req
  const validateSubmission = () => {
    for (const sale of sales) {
      if (!sale.bookTitle || !(sale.unitBuyBackPrice >= 0) || !sale.quantity) {
        showFailure(
          toast,
          "Book, retail price, and quantity are required for all line items"
        );
        return false;
      }
    }

    if (!date) {
      showFailure(toast, "Date is a required field");
      return false;
    }

    return true;
  };

  const onSubmit = (): void => {
    if (!validateSubmission()) {
      return;
    }

    if (isBBAddPage) {
      const apiSales = sales.map((sale) => {
        return {
          book: booksMap.get(sale.bookTitle),
          quantity: sale.quantity,
          unit_buyback_price: sale.unitBuyBackPrice,
        } as APIBBSaleRow;
      });

      const buyBack = {
        date: internalToExternalDate(date),
        sales: apiSales,
      } as AddBBReq;
      BUYBACK_API.addBuyBack(buyBack)
        .then(() => showSuccess(toast, "Buy back added successfully"))
        .catch(() => showFailure(toast, "Could not add buy back"));
    } else {
      // Otherwise, it is a modify page
      const apiSales = sales.map((sale) => {
        return {
          id: sale.isNewRow ? undefined : sale.id,
          book: sale.isNewRow ? booksMap.get(sale.bookTitle) : sale.bookId,
          quantity: sale.quantity,
          unit_buyback_price: sale.unitBuyBackPrice,
        } as APIBBSaleRow;
      });

      const buyBack = {
        id: buyBackID,
        date: internalToExternalDate(date),
        sales: apiSales,
      } as ModifyBBReq;

      BUYBACK_API.modifyBuyBack(buyBack)
        .then(() => showSuccess(toast, "Buy back modified successfully"))
        .catch(() => showFailure(toast, "Could not modify buy back"));
    }
  };

  // -------- TEMPLATES/VISUAL ELEMENTS --------

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  const actionBodyTemplate = (rowData: BBSaleRow) => {
    return (
      <React.Fragment>
        <Button
          type="button"
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger"
          onClick={() => deleteSale(rowData)}
          disabled={!isModifiable}
        />
      </React.Fragment>
    );
  };

  const leftToolbarTemplate = () => {
    return (
      <>
        <React.Fragment>
          <Button
            type="button"
            label="Add Book"
            className="p-button-info mr-2"
            icon="pi pi-plus"
            onClick={addNewSale}
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

  const columns = createColumns(COLUMNS);

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
      refreshKey={bookDropdownRefreshKey}
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
            {isBBAddPage ? (
              <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
                Add Buy Back Sale
              </h1>
            ) : (
              <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
                Modify Buy Back Sale
              </h1>
            )}
          </div>
          <form onSubmit={onSubmit}>
            <div className="flex flex-row justify-content-center card-container col-12">
              {!isBBAddPage && (
                <ToggleButton
                  id="modifyBBToggle"
                  name="modifyBBToggle"
                  onLabel="Editable"
                  offLabel="Edit"
                  onIcon="pi pi-check"
                  offIcon="pi pi-times"
                  disabled={isBBAddPage}
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
                  value={totalRevenue ?? 0}
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
              value={sales}
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
