import React, { useEffect, useRef, useState } from "react";
import { ToggleButton } from "primereact/togglebutton";
import { Calendar, CalendarProps } from "primereact/calendar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { createColumns, TableColumn } from "../../components/TableColumns";
import ConfirmPopup from "../../components/popups/ConfirmPopup";
import { v4 as uuid } from "uuid";
import {
  numberEditor,
  priceBodyTemplate,
  priceEditor,
} from "../../util/TableCellEditFuncs";
import { useNavigate, useParams } from "react-router-dom";
import { Toolbar } from "primereact/toolbar";
import { Button } from "primereact/button";
import {
  AddSRReq,
  APISRSaleRow,
  ModifySRReq,
  SALES_API,
} from "../../apis/SalesAPI";
import { Toast } from "primereact/toast";
import { internalToExternalDate } from "../../util/DateOperations";
import { InputNumber } from "primereact/inputnumber";
import BooksDropdown, {
  BooksDropdownData,
} from "../../components/dropdowns/BookDropdown";
import CSVUploader from "../../components/uploaders/CSVFileUploader";
import { FileUploadHandlerEvent } from "primereact/fileupload";
import {
  APIToInternalSalesCSVConversion,
  APIToInternalSRConversion,
} from "../../apis/Conversions";
import {
  showFailure,
  showSuccess,
  showWarningsMapper,
  showFailuresMapper,
} from "../../components/Toast";
import {
  CSVImport200Errors,
  CSVImport400Errors,
  errorCellBody,
} from "./errors/CSVImportErrors";
import { Book } from "../list/BookList";
import { useImmer } from "use-immer";
import { findById } from "../../util/IDOperations";
import { calculateTotal } from "../../util/CalculateTotal";
import { logger } from "../../util/Logger";
import DeletePopup from "../../components/popups/DeletePopup";

export interface SRSaleRow {
  isNewRow: boolean;
  id: string;
  bookId: number;
  bookTitle: string;
  quantity: number;
  price: number;
  errors?: { [key: string]: string };
}

export default function SRDetail() {
  const emptySale: SRSaleRow = {
    isNewRow: true,
    id: uuid(),
    bookId: 0,
    bookTitle: "",
    quantity: 1,
    price: 0,
  };

  // From URL
  const { id } = useParams();
  const isSRAddPage = id === undefined;
  const [isModifiable, setIsModifiable] = useState<boolean>(id === undefined);

  // For dropdown menus
  const [booksMap, setBooksMap] = useState<Map<string, Book>>(new Map());
  const [booksDropdownTitles, setBooksDropdownTitles] = useState<string[]>([]);

  // The rest of the data
  const [date, setDate] = useState<Date>(new Date());
  // useImmer is used to set state for nested data in a simplified format
  const [sales, setSales] = useImmer<SRSaleRow[]>([]);
  const [lineData, setLineData] = useState<SRSaleRow>(emptySale);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] =
    useState<boolean>(false);
  const [hasUploadedCSV, setHasUploadedCSV] = useState<boolean>(false);
  const [deletePopupVisible, setDeletePopupVisible] = useState<boolean>(false); // Whether the delete popup is shown
  const [isGoBackActive, setIsGoBackActive] = useState<boolean>(false);

  // Load the SR data on page load
  useEffect(() => {
    if (!isSRAddPage) {
      SALES_API.getSalesReconciliationDetail({ id: id! })
        .then((response) => {
          const salesReconciliation = APIToInternalSRConversion(response);
          setDate(salesReconciliation.date);
          setSales(salesReconciliation.sales);
          setTotalRevenue(salesReconciliation.totalRevenue);
        })
        .catch(() =>
          showFailure(toast, "Could not fetch sales reconciliation data")
        );
    }
  }, []);

  const COLUMNS: TableColumn[] = [
    {
      field: "errors",
      header: "Errors",
      hidden: !hasUploadedCSV,
      customBody: (rowData: SRSaleRow) => errorCellBody(rowData.errors),
    },
    {
      field: "bookTitle",
      header: "Book",
      customBody: (rowData: SRSaleRow) =>
        booksDropDownEditor(rowData.bookTitle, (newValue) => {
            setSales((draft) => {
              const sale = findById(draft, rowData.id);
              sale!.bookTitle = newValue;
              sale!.price = booksMap.get(newValue)!.retailPrice;
              setTotalRevenue(calculateTotal(draft));
            });
          },
          !isModifiable
        ),
    },

    {
      field: "quantity",
      header: "Quantity",
      customBody: (rowData: SRSaleRow) =>
        numberEditor(rowData.quantity, (newValue) => {
            setSales((draft) => {
              const sale = findById(draft, rowData.id);
              sale!.quantity = newValue;
              setTotalRevenue(calculateTotal(draft));
            });
          },
          !isModifiable
        ),
    },
    {
      field: "price",
      header: "Unit Retail Price ($)",
      customBody: (rowData: SRSaleRow) =>
        priceEditor(rowData.price, (newValue) => {
            setSales((draft) => {
              const sale = findById(draft, rowData.id);
              sale!.price = newValue;
              setTotalRevenue(calculateTotal(draft));
            });
          },
          !isModifiable
        ),
    },
    {
      field: "subtotal",
      header: "Subtotal ($)",
      customBody: (rowData: SRSaleRow) =>
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

  const deleteProduct = (rowData: SRSaleRow) => {
    const _data = sales.filter((val) => val.id !== rowData.id);
    setSales(_data);
    setTotalRevenue(calculateTotal(_data));
  };

  // Called to make delete pop up show
  const deleteSalesReconciliationPopup = () => {
    logger.debug("Delete Sales Reconciliation Clicked");
    setDeletePopupVisible(true);
  };

  // Call to actually delete the element
  const deleteSalesReconciliationFinal = () => {
    logger.debug("Delete Sales Reconciliation Finalized");
    setDeletePopupVisible(false);
    SALES_API.deleteSalesReconciliation({
      id: id!,
    })
      .then(() => {
        showSuccess(toast, "Sales Reconciliation Deleted");
        navigate("/sales-reconciliations");
      })
      .catch(() => showFailure(toast, "Sales Reconciliation Failed to Delete"));
  };

  // The delete popup
  const deletePopup = (
    <DeletePopup
      deleteItemIdentifier={" this sales reconciliation"}
      onConfirm={() => deleteSalesReconciliationFinal()}
      setIsVisible={setDeletePopupVisible}
    />
  );

  const csvUploadHandler = (event: FileUploadHandlerEvent) => {
    const csv = event.files[0];
    SALES_API.salesReconciliationCSVImport({ file: csv })
      .then((response) => {
        const sales = APIToInternalSalesCSVConversion(response.sales);
        setSales(sales);
        setHasUploadedCSV(true);

        // Show nonblocking errors (warnings)
        const nonBlockingErrors = response.errors;
        showWarningsMapper(toast, nonBlockingErrors, CSVImport200Errors);
      })
      .catch((error) => {
        showFailuresMapper(toast, error.data.errors, CSVImport400Errors);
      });
    event.options.clear();
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

    if (isSRAddPage) {
      callAddSRAPI();
    } else {
      // Otherwise, it is a modify page
      callModifySRAPI();
    }
  };

  // Add the sales reconciliation
  const callAddSRAPI = () => {
    const apiSales = sales.map((sale) => {
      return {
        book: Number(booksMap.get(sale.bookTitle)!.id),
        quantity: sale.quantity,
        unit_retail_price: sale.price,
      } as APISRSaleRow;
    });

    const salesReconciliation = {
      date: internalToExternalDate(date),
      sales: apiSales,
    } as AddSRReq;

    SALES_API.addSalesReconciliation(salesReconciliation)
      .then(() => {
        showSuccess(toast, "Sales reconciliation added successfully");
        isGoBackActive
          ? navigate("/sales-reconciliations")
          : window.location.reload();
      })
      .catch(() => showFailure(toast, "Could not add sales reconciliation"));
  };

  // Modify the sales reconciliation
  const callModifySRAPI = () => {
    const apiSales = sales.map((sale) => {
      return {
        id: sale.isNewRow ? undefined : sale.id,
        // If the book has been deleted, will have to use the id that is already present in the row
        book: booksMap.get(sale.bookTitle)?.id ?? sale.bookId,
        quantity: sale.quantity,
        unit_retail_price: sale.price,
      } as APISRSaleRow;
    });

    const salesReconciliation = {
      id: id,
      date: internalToExternalDate(date),
      sales: apiSales,
    } as ModifySRReq;

    SALES_API.modifySalesReconciliation(salesReconciliation)
      .then(() => {
        showSuccess(toast, "Sales reconciliation modified successfully");
        setIsModifiable(!isModifiable);
      })
      .catch(() => showFailure(toast, "Could not modify sales reconciliation"));

  };

  // -------- TEMPLATES/VISUAL ELEMENTS --------

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  const rowDeleteButton = (rowData: SRSaleRow) => {
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
      <>
        {isModifiable && (
          <React.Fragment>
            <Button
              type="button"
              label="New"
              icon="pi pi-plus"
              className="p-button-info mr-2"
              onClick={addNewSale}
              disabled={!isModifiable}
            />
            <CSVUploader uploadHandler={csvUploadHandler} />
          </React.Fragment>
        )}
      </>
    );
  };

  const centerToolbarTemplate = () => {
    return (
      <React.Fragment>
        {!isSRAddPage && !isModifiable && (
          <Button
            id="modifyBBToggle"
            name="modifyBBToggle"
            label="Edit"
            icon="pi pi-pencil"
            disabled={isSRAddPage}
            onClick={() => {
              setIsModifiable(!isModifiable);
            }}
          />
        )}
        {!isSRAddPage && isModifiable && (
          <Button
            id="modifyBBToggle2"
            name="modifyBBToggle2"
            label="Cancel"
            icon="pi pi-times"
            className="p-button-warning"
            disabled={isSRAddPage}
            onClick={() => {
              setIsModifiable(!isModifiable);
              window.location.reload();
            }}
          />
        )}
      </React.Fragment>
    );
  };

  const rightToolbarTemplate = () => {
    return (
      <React.Fragment>
        {isModifiable && (
          <ConfirmPopup
            isVisible={isConfirmationPopupVisible}
            hideFunc={() => setIsConfirmationPopupVisible(false)}
            acceptFunc={onSubmit}
            rejectFunc={() => {
              // do nothing
            }}
            buttonClickFunc={() => {
              setIsConfirmationPopupVisible(true);
            }}
            disabled={!isModifiable}
            label={"Submit"}
            className="p-button-success p-button-raised"
          />
        )}
        {isModifiable && isSRAddPage && (
          <ConfirmPopup
            isVisible={isConfirmationPopupVisible}
            hideFunc={() => setIsConfirmationPopupVisible(false)}
            acceptFunc={onSubmit}
            rejectFunc={() => {
              setIsGoBackActive(false);
            }}
            buttonClickFunc={() => {
              setIsConfirmationPopupVisible(true);
              setIsGoBackActive(true);
            }}
            disabled={!isModifiable}
            label={"Submit and Go Back"}
            className="p-button-success p-button-raised ml-2"
          />
        )}
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
    onChange: (newValue: string) => void,
    isDisabled?: boolean
  ) => (
    <BooksDropdown
      // This will always be used in a table cell, so we can disable the warning
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      setSelectedBook={onChange}
      selectedBook={value}
      isDisabled={isDisabled}
      bookTitlesList={booksDropdownTitles}
      placeholder={value}
    />
  );

  const columns = createColumns(COLUMNS);

  // The navigator to switch pages
  const navigate = useNavigate();

  return (
    <div>
      <Toast ref={toast} />
      <div className="grid flex justify-content-center">
        <div className="flex col-12 p-0">
          <div className="flex col-1">
            <Button
              type="button"
              label="Back"
              icon="pi pi-arrow-left"
              onClick={() => navigate("/sales-reconciliations")}
              className="p-button-sm my-auto ml-1"
            />
          </div>
          <div className="pt-2 col-10">
            {isSRAddPage ? (
              <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
                Add Sales Reconciliation
              </h1>
            ) : isModifiable ? (
              <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
                Modify Sales Reconciliation
              </h1>
            ) : (
              <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
                Sales Reconciliation Details
              </h1>
            )}
          </div>
          <div className="flex col-1">
            {!isSRAddPage && (
              <Button
                type="button"
                label="Delete"
                icon="pi pi-trash"
                onClick={() => deleteSalesReconciliationPopup()}
                className="p-button-sm my-auto ml-1 p-button-danger"
              />
            )}
          </div>
        </div>
        <div className="col-11">
          <form id="localForm">
            <Toolbar
              className="mb-4"
              left={leftToolbarTemplate}
              center={centerToolbarTemplate}
              right={rightToolbarTemplate}
            />

            <div className="flex pb-2 flex-row justify-content-evenly card-container col-12">
              <div className="flex">
                <label
                  className="p-component p-text-secondary my-auto text-teal-900 pr-2"
                  htmlFor="totalrevenue"
                >
                  Total Revenue:
                </label>
                <p className="p-component p-text-secondary text-900 text-xl text-center my-auto">
                  {priceBodyTemplate(totalRevenue ?? 0)}
                </p>
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
                    setDate(event.value as Date);
                  }}
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
                body={rowDeleteButton}
                header="Delete Line Item"
                hidden={!isModifiable}
                exportable={false}
                style={{ minWidth: "8rem" }}
              ></Column>
            </DataTable>

            {/* Maybe be needed in case the confrim button using the popup breaks */}
            {/* <Button type="submit" onClick={this.onSubmit} /> */}
          </form>
        </div>
        {deletePopupVisible && deletePopup}
      </div>
    </div>
  );
}
