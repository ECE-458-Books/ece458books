import { Calendar, CalendarChangeEvent } from "primereact/calendar";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { ToggleButton } from "primereact/togglebutton";
import { Toolbar } from "primereact/toolbar";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuid } from "uuid";
import { TableColumn, createColumns } from "../../components/TableColumns";
import {
  numberEditor,
  priceBodyTemplate,
  priceEditor,
} from "../../util/TableCellEditFuncs";
import { errorCellBody } from "./errors/CSVImportErrors";
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
import { findById } from "../../util/FindBy";
import { calculateTotal } from "../../util/CalculateTotal";
import { Book } from "../list/BookList";

import { useImmer } from "use-immer";
import { APIToInternalBBConversion } from "../../apis/Conversions";
import { Dropdown } from "primereact/dropdown";
import { VENDORS_API } from "../../apis/VendorsAPI";
import BooksDropdown, {
  BooksDropdownData,
} from "../../components/dropdowns/BookDropdown";

export interface BBDetailState {
  id: number;
  isAddPage: boolean;
  isModifiable: boolean;
}

export interface BBSaleRow {
  isNewRow: boolean;
  id: string;
  bookId: number;
  bookTitle: string;
  quantity: number;
  price: number;
  errors?: { [key: string]: string };
}

export default function BBDetail() {
  // Used for setting initial state
  const emptySale: BBSaleRow = {
    isNewRow: true,
    id: uuid(),
    bookId: 0,
    bookTitle: "",
    quantity: 1,
    price: 0,
  };

  // -------- STATE --------
  // From URL
  const { id } = useParams();
  const isBBAddPage = id === undefined;
  const [isModifiable, setIsModifiable] = useState<boolean>(id === undefined);

  // For dropdown menus
  const [booksMap, setBooksMap] = useState<Map<string, Book>>(new Map());
  const [vendorMap, setVendorMap] = useState<Map<string, number>>(new Map());
  const [booksDropdownTitles, setBooksDropdownTitles] = useState<string[]>([]);

  // The rest of the data
  const [date, setDate] = useState<Date>(new Date());
  const [selectedVendorName, setSelectedVendorName] = useState<string>("");

  // useImmer is used to set state for nested data in a simplified format
  const [sales, setSales] = useImmer<BBSaleRow[]>([]);
  const [lineData, setLineData] = useState<BBSaleRow>(emptySale);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] =
    useState<boolean>(false);
  const [isBooksBuyBackSold, setIsBooksBuyBackSold] = useState<boolean>(false);
  const [hasUploadedCSV, setHasUploadedCSV] = useState<boolean>(false);

  // Load the SR data on page load
  useEffect(() => {
    if (!isBBAddPage) {
      BUYBACK_API.getBuyBackDetail({ id: id! })
        .then((response) => {
          const buyBack = APIToInternalBBConversion(response);
          setDate(buyBack.date);
          setSales(buyBack.sales);
          setTotalRevenue(buyBack.totalRevenue);
          setSelectedVendorName(buyBack.vendorName);
        })
        .catch(() => showFailure(toast, "Could not fetch buy back sales data"));
    }

    setIsBooksBuyBackSold(sales.length > 0);
  }, []);

  useEffect(() => {
    setIsBooksBuyBackSold(sales.length > 0);
  }, [sales]);

  const COLUMNS: TableColumn[] = [
    {
      field: "errors",
      header: "Errors",
      hidden: !hasUploadedCSV,
      customBody: (rowData: BBSaleRow) => errorCellBody(rowData.errors),
    },
    {
      field: "bookTitle",
      header: "Book",
      customBody: (rowData: BBSaleRow) =>
        booksDropDownEditor(rowData.bookTitle, (newValue) => {
          setSales((draft) => {
            const purchase = findById(draft, rowData.id);
            purchase!.bookTitle = newValue;
            purchase!.price = booksMap.get(newValue)!.retailPrice;
            setTotalRevenue(calculateTotal(draft));
          });
        }),
    },
    {
      field: "quantity",
      header: "Quantity",
      customBody: (rowData: BBSaleRow) =>
        numberEditor(rowData.quantity, (newValue) => {
          setSales((draft) => {
            const purchase = findById(draft, rowData.id);
            purchase!.quantity = newValue;
            setTotalRevenue(calculateTotal(draft));
          });
        }),
      style: { width: "15%" },
    },
    {
      field: "price",
      header: "Unit Buy Back Price ($)",
      customBody: (rowData: BBSaleRow) =>
        priceEditor(rowData.price, (newValue) => {
          setSales((draft) => {
            const purchase = findById(draft, rowData.id);
            purchase!.price = newValue;
            setTotalRevenue(calculateTotal(draft));
          });
        }),
    },
    {
      field: "subtotal",
      header: "Subtotal ($)",
      customBody: (rowData: BBSaleRow) =>
        priceBodyTemplate(rowData.price * rowData.quantity),
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
      if (!sale.bookTitle || !(sale.price >= 0) || !sale.quantity) {
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
      callAddBBAPI();
    } else {
      // Otherwise, it is a modify page
      callModifyBBAPI();
    }
  };

  // Add the buy back
  const callAddBBAPI = () => {
    const apiSales = sales.map((sale) => {
      return {
        book: Number(booksMap.get(sale.bookTitle)!.id),
        quantity: sale.quantity,
        unit_buyback_price: sale.price,
      } as APIBBSaleRow;
    });

    const buyBack = {
      date: internalToExternalDate(date),
      vendor: vendorMap.get(selectedVendorName),
      buybacks: apiSales,
    } as AddBBReq;
    BUYBACK_API.addBuyBack(buyBack)
      .then(() => showSuccess(toast, "Buy back added successfully"))
      .catch(() => showFailure(toast, "Could not add buy back"));
  };

  // Modify the sales reconciliation
  const callModifyBBAPI = () => {
    // Otherwise, it is a modify page
    const apiSales = sales.map((sale) => {
      return {
        id: sale.isNewRow ? undefined : sale.id,
        book: booksMap.get(sale.bookTitle)?.id ?? sale.bookId,
        quantity: sale.quantity,
        unit_buyback_price: sale.price,
      } as APIBBSaleRow;
    });

    const buyBack = {
      id: id,
      date: internalToExternalDate(date),
      vendor: vendorMap.get(selectedVendorName),
      buybacks: apiSales,
    } as ModifyBBReq;

    BUYBACK_API.modifyBuyBack(buyBack)
      .then(() => showSuccess(toast, "Buy back modified successfully"))
      .catch(() => showFailure(toast, "Could not modify buy back"));
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
            disabled={!isModifiable || selectedVendorName == ""}
          />
        </React.Fragment>
      </>
    );
  };

  const centerToolbarTemplate = () => {
    return (
      <React.Fragment>
        {!isBBAddPage && !isModifiable && (
          <Button
            id="modifyBBToggle"
            name="modifyBBToggle"
            label="Edit"
            icon="pi pi-pencil"
            disabled={isBBAddPage}
            onClick={() => setIsModifiable(!isModifiable)}
          />
        )}
        {!isBBAddPage && isModifiable && (
          <Button
            id="modifyBBToggle2"
            name="modifyBBToggle2"
            label="Cancel"
            icon="pi pi-times"
            className="p-button-warning"
            disabled={isBBAddPage}
            onClick={() => setIsModifiable(!isModifiable)}
          />
        )}
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

  // Get the data for the books dropdown
  useEffect(
    () =>
      BooksDropdownData({
        setBooksMap: setBooksMap,
        setBookTitlesList: setBooksDropdownTitles,
        vendorName: vendorMap.get(selectedVendorName)!,
      }),
    [selectedVendorName]
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
      placeholder={value}
    />
  );

  const [vendorNamesList, setVendorNamesList] = useState<string[]>([]);

  useEffect(() => {
    VENDORS_API.getVendorsNoPaginationBuyBackPolicy().then((response) => {
      const tempVendorMap = new Map<string, number>();
      for (const vendor of response) {
        tempVendorMap.set(vendor.name, vendor.id);
      }
      setVendorMap(tempVendorMap);
      setVendorNamesList(response.map((vendor) => vendor.name));
    });
  }, []);

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
                Add Buy Back Sales
              </h1>
            ) : (
              <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
                Modify Buy Back Sales
              </h1>
            )}
          </div>
          <form onSubmit={onSubmit}>
            <Toolbar
              className="mb-4"
              left={leftToolbarTemplate}
              center={centerToolbarTemplate}
              right={rightToolbarTemplate}
            />

            <div className="flex col-12 justify-content-evenly mb-3">
              <div className="flex">
                <label
                  className="p-component p-text-secondary my-auto text-teal-900 pr-2"
                  htmlFor="totalcost"
                >
                  Total Revenue ($):
                </label>
                <p className="p-component p-text-secondary text-900 text-xl text-center my-auto">
                  {totalRevenue ?? 0}
                </p>
              </div>
              <div>
                <label
                  htmlFor="date"
                  className="p-component text-teal-900 p-text-secondary my-auto pr-2"
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
                  className="p-component text-teal-900 p-text-secondary my-auto pr-2"
                >
                  Vendor
                </label>
                <Dropdown
                  value={selectedVendorName}
                  options={vendorNamesList}
                  placeholder="Select a Vendor"
                  filter
                  disabled={!isModifiable || isBooksBuyBackSold}
                  onChange={(e) => setSelectedVendorName(e.value)}
                  virtualScrollerOptions={{ itemSize: 35 }}
                />
              </div>
            </div>

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
                header="Delete Line Item"
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
