import React, { useEffect, useRef, useState } from "react";
import { ToggleButton } from "primereact/togglebutton";
import { Calendar, CalendarProps } from "primereact/calendar";
import { Dropdown, DropdownProps } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column, ColumnEditorOptions, ColumnEvent } from "primereact/column";
import { TableColumn } from "../../components/Table";
import ConfirmButton from "../../components/ConfirmButton";
import { v4 as uuid } from "uuid";
import {
  isPositiveInteger,
  numberEditor,
  priceBodyTemplateUnit,
  priceEditor,
  textEditor,
} from "../../util/TableCellEditFuncs";
import { useLocation } from "react-router-dom";
import { Toolbar } from "primereact/toolbar";
import { Button } from "primereact/button";
import {
  APISRCreate,
  APISRModify,
  APISRSaleRow,
  SALES_API,
} from "../../apis/SalesAPI";
import { BOOKS_API } from "../../apis/BooksAPI";
import { BooksList } from "./PODetail";
import { Toast } from "primereact/toast";
import { toYYYYMMDDWithDash } from "../../util/DateOperations";

export interface SRDetailState {
  id: number;
  date: any;
  sales: SRSaleRow[];
  isAddPage: boolean;
  isModifiable: boolean;
  isConfirmationPopupVisible: boolean;
}

export interface SRSaleRow {
  isNewRow: boolean;
  id: string;
  book: number;
  book_title: string;
  quantity: number;
  unit_retail_price: number;
}

export default function SRDetail() {
  const emptyProduct = {
    isNewRow: true,
    id: uuid(),
    book: 0,
    book_title: "",
    quantity: 1,
    unit_retail_price: 0,
  };

  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const detailState = (location.state! as SRDetailState) ?? {
    id: -1,
    date: new Date(),
    sales: [
      {
        isNewRow: true,
        id: uuid(),
        book: 0,
        book_title: "",
        quantity: 1,
        unit_retail_price: 0,
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
  const [sales, setSales] = useState(detailState.sales);
  const [salesReconciliationID, setSalesReconciliationID] = useState(
    detailState.id
  );
  const [lineData, setLineData] = useState(emptyProduct);
  const [bookTitlesList, setBookTitlesList] = useState<string[]>();
  const [bookMap, setBookMap] = useState<Map<string, number>>(new Map());
  const [isSRAddPage, setIsSRAddPage] = useState(detailState.isAddPage);
  const [isModifiable, setIsModifiable] = useState(detailState.isModifiable);
  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] = useState(
    detailState.isConfirmationPopupVisible
  );

  const COLUMNS: TableColumn[] = [
    { field: "book", header: "ID", filterPlaceholder: "ID", hidden: true },
    {
      field: "book_title",
      header: "Book",
      filterPlaceholder: "book",
      cellEditor: (options: ColumnEditorOptions) =>
        booksDropDownEditor(options),
    },

    {
      field: "quantity",
      header: "Quantity",
      filterPlaceholder: "Quantity",
      cellEditor: (options: ColumnEditorOptions) => numberEditor(options),
      cellEditValidator: (event: ColumnEvent) => event.newValue > 0,
    },
    {
      field: "unit_retail_price",
      header: "Unit Retail Price ($)",
      filterPlaceholder: "Price",
      cellEditor: (options: ColumnEditorOptions) => priceEditor(options),
      cellEditValidator: (event: ColumnEvent) => event.newValue > 0,
    },
  ];

  const onCellEditComplete = (event: ColumnEvent) => {
    event.rowData[event.field] = event.newValue;
  };

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
    BOOKS_API.getBooksNOPaging().then((response) => {
      const tempBookMap = new Map<string, number>();
      for (const book of response.books) {
        tempBookMap.set(book.title, book.id);
      }
      setBookMap(tempBookMap);
      setBookTitlesList(response.books.map((book) => book.title));
    });
  }, []);

  // Validate submission before making API req
  const validateSubmission = (sr: SRSaleRow[]) => {
    for (const sale of sr) {
      if (
        !sale.book_title ||
        !(sale.unit_retail_price >= 0) ||
        !sale.quantity
      ) {
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
          book: bookMap.get(sale.book_title),
          quantity: sale.quantity,
          unit_retail_price: sale.unit_retail_price,
        } as APISRSaleRow;
      });

      const salesReconciliation = {
        date: toYYYYMMDDWithDash(date),
        sales: apiSales,
      } as APISRCreate;

      SALES_API.addSalesReconciliation(salesReconciliation).then((response) => {
        if (response.status == 201) {
          showSuccess("Sales reconciliation added successfully");
        } else {
          showFailure("Could not add sales reconciliation");
          return;
        }
      });
    } else {
      // Otherwise, it is a modify page
      const apiSales = sales.map((sale) => {
        return {
          id: sale.isNewRow ? undefined : sale.id,
          book: sale.isNewRow ? bookMap.get(sale.book_title) : sale.book,
          quantity: sale.quantity,
          unit_retail_price: sale.unit_retail_price,
        } as APISRSaleRow;
      });

      const salesReconciliation = {
        id: salesReconciliationID,
        date: toYYYYMMDDWithDash(date),
        sales: apiSales,
      } as APISRModify;

      SALES_API.modifySalesReconciliation(salesReconciliation).then(
        (response) => {
          if (response.status == 200) {
            showSuccess("Sales reconciliation edited successfully");
          } else {
            showFailure("Could not edit sales reconciliation");
            return;
          }
        }
      );
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
          onClick={addNewSale}
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
          label={"Submit"}
          className="p-button-success p-button-raised"
        />
      </React.Fragment>
    );
  };

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
              value={sales}
              className="editable-cells-table"
              responsiveLayout="scroll"
              editMode="cell"
            >
              {COLUMNS.map((col) => {
                return (
                  <Column
                    key={col.field}
                    field={col.field}
                    header={col.header}
                    style={{ width: "25%" }}
                    body={
                      col.field === "unit_retail_price" && priceBodyTemplateUnit
                    }
                    editor={col.cellEditor}
                    onCellEditComplete={onCellEditComplete}
                    hidden={col.hidden}
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
