import React, { useEffect, useRef, useState } from "react";
import { DataTable, DataTableRowClickEvent } from "primereact/datatable";
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
import {
  AddSRReq,
  APISRSaleRow,
  ModifySRReq,
  SALES_API,
} from "../../apis/SalesAPI";
import { Toast } from "primereact/toast";
import { internalToExternalDate } from "../../util/DateOperations";
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
  showFailuresMapper,
  showWarning,
} from "../../components/Toast";
import { CSVImport400Errors, errorCellBody } from "./errors/CSVImportErrors";
import { Book } from "../list/BookList";
import { useImmer } from "use-immer";
import { filterById, findById } from "../../util/IDOperations";
import { calculateTotal } from "../../util/CalculateTotal";
import { logger } from "../../util/Logger";
import DeletePopup from "../../components/popups/DeletePopup";
import AddDetailModifyTitle from "../../components/text/AddDetailModifyTitle";
import BackButton from "../../components/buttons/BackButton";
import DeleteButton from "../../components/buttons/DeleteButton";
import AddRowButton from "../../components/buttons/AddRowButton";
import EditCancelButton from "../../components/buttons/EditCancelDetailButton";
import TotalDollars from "../../components/text/TotalDollars";
import OneDayCalendar from "../../components/OneDayCalendar";
import DeleteColumn from "../../components/datatable/DeleteColumn";

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

  // Get the data for the books dropdown
  useEffect(
    () =>
      BooksDropdownData({
        setBooksMap: setBooksMap,
        setBookTitlesList: setBooksDropdownTitles,
      }),
    []
  );

  const COLUMNS: TableColumn[] = [
    {
      field: "errors",
      header: "Errors",
      hidden: !hasUploadedCSV,
      customBody: (rowData: SRSaleRow) => errorCellBody(rowData.errors),
      style: { minWidth: "2rem" },
    },
    {
      field: "bookTitle",
      header: "Book",
      customBody: (rowData: SRSaleRow) =>
        booksDropDownEditor(
          rowData.bookTitle,
          (newValue) => {
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
        numberEditor(
          rowData.quantity,
          (newValue) => {
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
        priceEditor(
          rowData.price,
          (newValue) => {
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
      style: { minWidth: "8rem" },
    },
  ];

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

  // The navigator to switch pages
  const navigate = useNavigate();

  const onRowClick = (event: DataTableRowClickEvent) => {
    // I couldn't figure out a better way to do this...
    // It takes the current index as the table knows it and calculates the actual index in the books array
    const index = event.index;
    const sale = sales[index];
    logger.debug("Purchase Order Row Clicked", sale);
    toBookDetailsPage(sale);
  };

  // Callback functions for edit/delete buttons
  const toBookDetailsPage = (sale: SRSaleRow) => {
    logger.debug("Edit Book Clicked", sale);
    navigate(`/books/detail/${sale.bookId}`);
  };

  const csvUploadHandler = (event: FileUploadHandlerEvent) => {
    const csv = event.files[0];
    SALES_API.salesReconciliationCSVImport({ file: csv })
      .then((response) => {
        const sales = APIToInternalSalesCSVConversion(response.sales);
        setSales(sales);
        setHasUploadedCSV(true);

        // Show nonblocking errors (warnings)
        const nonBlockingErrors = response.errors;
        for (const warning of nonBlockingErrors ?? []) {
          showWarning(
            toast,
            warning.concat(" is an extra column and was not used")
          );
        }
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
  const toast = useRef<Toast>(null);

  // Top Line

  const titleText = (
    <div className="pt-2 col-10">
      <AddDetailModifyTitle
        isModifyPage={isModifiable}
        isAddPage={isSRAddPage}
        detailTitle={"Sales Reconciliation Details"}
        addTitle={"Add Sales Reconciliation"}
        modifyTitle={"Modify Sales Reconciliation"}
      />
    </div>
  );

  const backButton = (
    <div className="flex col-1">
      <BackButton
        onClick={() => navigate("/sales-reconciliations")}
        className="ml-1"
      />
    </div>
  );

  const deleteButton = (
    <div className="flex col-1">
      <DeleteButton
        isEnabled={!isSRAddPage}
        onClick={deleteSalesReconciliationPopup}
      />
    </div>
  );

  const deletePopup = (
    <DeletePopup
      deleteItemIdentifier={" this sales reconciliation"}
      onConfirm={() => deleteSalesReconciliationFinal()}
      setIsVisible={setDeletePopupVisible}
    />
  );

  // Toolbar

  // Left
  const addRowButton = (
    <AddRowButton
      emptyItem={emptySale}
      rows={sales}
      setRows={setSales}
      isDisabled={!isModifiable}
      label={"Add Book"}
      isVisible={isModifiable}
    />
  );

  const csvImportButton = (
    <CSVUploader visible={isModifiable} uploadHandler={csvUploadHandler} />
  );

  const leftToolbar = (
    <>
      {addRowButton}
      {csvImportButton}
    </>
  );

  // Center
  const editCancelButton = (
    <EditCancelButton
      onClickEdit={() => setIsModifiable(!isModifiable)}
      onClickCancel={() => {
        setIsModifiable(!isModifiable);
        window.location.reload();
      }}
      isAddPage={isSRAddPage}
      isModifiable={isModifiable}
    />
  );

  // Right
  const submitButton = (
    <ConfirmPopup
      isButtonVisible={isModifiable}
      isPopupVisible={isConfirmationPopupVisible}
      hideFunc={() => setIsConfirmationPopupVisible(false)}
      onFinalSubmission={onSubmit}
      onShowPopup={() => setIsConfirmationPopupVisible(true)}
      disabled={!isModifiable}
      label={"Submit"}
      className="p-button-success ml-2"
    />
  );

  const submitAndGoBackButton = (
    <ConfirmPopup
      isButtonVisible={isModifiable && isSRAddPage}
      isPopupVisible={isConfirmationPopupVisible && isModifiable && isSRAddPage}
      hideFunc={() => setIsConfirmationPopupVisible(false)}
      onFinalSubmission={onSubmit}
      onRejectFinalSubmission={() => {
        setIsGoBackActive(false);
      }}
      onShowPopup={() => {
        setIsConfirmationPopupVisible(true);
        setIsGoBackActive(true);
      }}
      disabled={!isModifiable}
      label={"Submit and Go Back"}
      className="p-button-success ml-2"
    />
  );

  const rightToolbar = (
    <>
      {submitAndGoBackButton}
      {submitButton}
    </>
  );

  // Items below toolbar

  const totalDollars = (
    <div className="flex">
      <TotalDollars label={"Total Revenue:"} totalDollars={totalRevenue} />
    </div>
  );

  const calendar = (
    <OneDayCalendar disabled={!isModifiable} date={date} setDate={setDate} />
  );

  // Datatable

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

  // Delete icon for each row
  const deleteColumn = DeleteColumn<SRSaleRow>({
    onDelete: (rowData) => {
      const newSales = filterById(sales, rowData.id, setSales);
      setTotalRevenue(calculateTotal(newSales));
    },
    hidden: !isModifiable,
  });

  const columns = createColumns(COLUMNS);

  return (
    <div>
      <Toast ref={toast} />
      <div className="grid flex justify-content-center">
        <div className="flex col-12 p-0">
          <div className="flex col-12 p-0">
            {backButton}
            {titleText}
            {deleteButton}
          </div>
        </div>
        <div className="col-11">
          <form id="localForm">
            <Toolbar
              className="mb-4"
              left={leftToolbar}
              center={editCancelButton}
              right={rightToolbar}
            />

            <div className="flex pb-2 flex-row justify-content-evenly card-container col-12">
              {totalDollars}
              {calendar}
            </div>

            <DataTable
              showGridlines
              value={sales}
              className="editable-cells-table"
              responsiveLayout="scroll"
              editMode="cell"
              rowHover={!isSRAddPage}
              selectionMode={"single"}
              onRowClick={(event) => {
                if (!isSRAddPage && !isModifiable) {
                  onRowClick(event);
                }
              }}
            >
              {columns}
              {deleteColumn}
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
