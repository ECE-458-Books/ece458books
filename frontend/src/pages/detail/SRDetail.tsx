import React, { useEffect, useRef, useState } from "react";
import { ToggleButton } from "primereact/togglebutton";
import { Calendar, CalendarProps } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column, ColumnEditorOptions, ColumnEvent } from "primereact/column";
import { createColumns, TableColumn } from "../../components/TableColumns";
import ConfirmPopup from "../../components/ConfirmPopup";
import { v4 as uuid } from "uuid";
import {
  numberEditor,
  priceBodyTemplate,
  priceEditor,
} from "../../util/TableCellEditFuncs";
import { useLocation } from "react-router-dom";
import { Toolbar } from "primereact/toolbar";
import { Button } from "primereact/button";
import {
  AddSRReq,
  APISRSaleRow,
  ModifySRReq,
  SALES_API,
} from "../../apis/SalesAPI";
import { BOOKS_API } from "../../apis/BooksAPI";
import { Toast } from "primereact/toast";
import { toYYYYMMDDWithDash } from "../../util/DateOperations";
import { InputNumber } from "primereact/inputnumber";

export interface SRDetailState {
  id: number;
  date: any;
  totalRevenue: number;
  sales: SRSaleRow[];
  isAddPage: boolean;
  isModifiable: boolean;
  isConfirmationPopupVisible: boolean;
}

export interface SRSaleRow {
  isNewRow: boolean;
  id: string;
  subtotal: number;
  bookId: number;
  bookTitle: string;
  quantity: number;
  unitRetailPrice: number;
}

export default function SRDetail() {
  const emptyProduct: SRSaleRow = {
    isNewRow: true,
    id: uuid(),
    subtotal: 0,
    bookId: 0,
    bookTitle: "",
    quantity: 1,
    unitRetailPrice: 0,
  };

  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const detailState = (location.state! as SRDetailState) ?? {
    id: -1,
    date: new Date(),
    totalRevenue: 0,
    sales: [
      {
        isNewRow: true,
        id: uuid(),
        bookId: 0,
        subtotal: 0,
        bookTitle: "",
        quantity: 1,
        unitRetailPrice: 0,
      },
    ],
    isAddPage: true,
    isModifiable: true,
    isConfirmationPopupVisible: false,
  };

  for (const sale of detailState.sales) {
    sale.isNewRow = false;
  }

  const [date, setDate] = useState(detailState.date);
  const [sales, setSales] = useState<SRSaleRow[]>(detailState.sales);
  const salesReconciliationID = detailState.id;
  const [lineData, setLineData] = useState<SRSaleRow>(emptyProduct);
  const [bookTitlesList, setBookTitlesList] = useState<string[]>();
  const totalRevenue = detailState.totalRevenue;
  const [bookMap, setBookMap] = useState<Map<string, number>>(new Map());
  const isSRAddPage = useState<boolean>(detailState.isAddPage);
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
      cellEditor: (options: ColumnEditorOptions) => numberEditor(options),
      cellEditValidator: (event: ColumnEvent) => event.newValue > 0,
    },
    {
      field: "unitRetailPrice",
      header: "Unit Retail Price ($)",
      cellEditor: (options: ColumnEditorOptions) => priceEditor(options),
      cellEditValidator: (event: ColumnEvent) => event.newValue > 0,
      customBody: (rowData: SRSaleRow) =>
        priceBodyTemplate(rowData.unitRetailPrice),
    },
    {
      field: "subtotal",
      header: "Subtotal ($)",
      customBody: (rowData: SRSaleRow) => priceBodyTemplate(rowData.subtotal),
    },
  ];

  const addNewSale = () => {
    setLineData(emptyProduct);
    const _lineData = lineData;
    _lineData.id = uuid();
    setLineData(_lineData);
    const _data = [...sales];
    _data.push({ ...lineData });
    setSales(_data);
  };

  const deleteProduct = (rowData: SRSaleRow) => {
    const _data = sales.filter((val) => val.id !== rowData.id);
    setSales(_data);
  };

  // Populate the book list on page load
  useEffect(() => {
    BOOKS_API.getBooksNoPagination().then((response) => {
      const tempBookMap = new Map<string, number>();
      for (const book of response) {
        tempBookMap.set(book.title, book.id);
      }
      setBookMap(tempBookMap);
      setBookTitlesList(response.map((book) => book.title));
    });
  }, []);

  // Validate submission before making API req
  const validateSubmission = (sr: SRSaleRow[]) => {
    for (const sale of sr) {
      if (!sale.bookTitle || !(sale.unitRetailPrice >= 0) || !sale.quantity) {
        showFailure("All fields are required");
        return false;
      }
    }

    if (!date) {
      showFailure("All fields are required");
      return false;
    }

    return true;
  };

  const onSubmit = (): void => {
    if (!validateSubmission(sales)) {
      return;
    }

    if (isSRAddPage) {
      const apiSales = sales.map((sale) => {
        return {
          book: bookMap.get(sale.bookTitle),
          quantity: sale.quantity,
          unit_retail_price: sale.unitRetailPrice,
        } as APISRSaleRow;
      });

      const salesReconciliation = {
        date: toYYYYMMDDWithDash(date),
        sales: apiSales,
      } as AddSRReq;
      SALES_API.addSalesReconciliation(salesReconciliation)
        .then(() => showSuccess("Sales reconciliation added successfully"))
        .catch(() => showFailure("Could not add sales reconciliation"));
    } else {
      // Otherwise, it is a modify page
      const apiSales = sales.map((sale) => {
        return {
          id: sale.isNewRow ? undefined : sale.id,
          book: sale.isNewRow ? bookMap.get(sale.bookTitle) : sale.bookId,
          quantity: sale.quantity,
          unit_retail_price: sale.unitRetailPrice,
        } as APISRSaleRow;
      });

      const salesReconciliation = {
        id: salesReconciliationID,
        date: toYYYYMMDDWithDash(date),
        sales: apiSales,
      } as ModifySRReq;

      SALES_API.modifySalesReconciliation(salesReconciliation)
        .then(() => showSuccess("Sales reconciliation modified successfully"))
        .catch(() => showFailure("Could not modify sales reconciliation"));
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

  const actionBodyTemplate = (rowData: SRSaleRow) => {
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
          onClick={addNewSale}
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
          buttonClickFunc={() => {
            setIsConfirmationPopupVisible(true);
          }}
          disabled={!isModifiable}
          label={"Submit"}
          className="p-button-success p-button-raised"
        />
      </React.Fragment>
    );
  };

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
            {isSRAddPage ? (
              <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
                Add Sales Reconciliation
              </h1>
            ) : (
              <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
                Modify Sales Reconciliation
              </h1>
            )}
          </div>
          <form id="localForm">
            <div className="flex flex-row justify-content-center card-container col-12">
              {!isSRAddPage && (
                <ToggleButton
                  id="modifySRToggle"
                  name="modifySRToggle"
                  onLabel="Editable"
                  offLabel="Edit"
                  onIcon="pi pi-check"
                  offIcon="pi pi-times"
                  checked={isModifiable}
                  disabled={isSRAddPage}
                  onChange={() => setIsModifiable(!isModifiable)}
                />
              )}
            </div>

            <div className="flex pb-2 flex-row justify-content-evenly card-container col-12">
              <div>
                <label
                  className="p-component p-text-secondary pr-2 pt-2 text-teal-900"
                  htmlFor="totalrevenue"
                >
                  Total Revenue ($):
                </label>
                <InputNumber
                  id="totalrevenue2"
                  className="w-6"
                  useGrouping={false}
                  minFractionDigits={2}
                  name="totalrevenue2"
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
            {/* <Button type="submit" onClick={this.onSubmit} /> */}
          </form>
        </div>
      </div>
    </div>
  );
}
