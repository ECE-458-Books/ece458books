import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  APISRSaleRow,
  AddSRReq,
  ModifySRReq,
  SALES_API,
} from "../../apis/sales/SalesAPI";
import { Toast } from "primereact/toast";
import { BooksDropdownData } from "../../components/dropdowns/BookDropdown";
import {
  APIToInternalSRConversion,
  APIToInternalSalesCSVConversion,
} from "../../apis/sales/SalesConversions";
import {
  showFailure,
  showFailuresFunctionCaller,
  showSuccess,
  showWarning,
} from "../../components/Toast";
import { Book } from "../books/BookList";
import { useImmer } from "use-immer";
import { logger } from "../../util/Logger";
import DeletePopup from "../../components/popups/DeletePopup";
import AddDetailModifyTitle from "../../components/text/AddDetailModifyTitle";
import BackButton from "../../components/buttons/BackButton";
import DeleteButton from "../../components/buttons/DeleteButton";
import TotalDollars from "../../components/text/TotalDollars";
import OneDayCalendar from "../../components/OneDayCalendar";
import "../../css/TableCell.css";
import LineItemTableTemplate, {
  LineItem,
  emptyLineItem,
} from "../../templates/inventorydetail/LineItemTableTemplate";
import {
  CSVImport200OverallErrors,
  CSVImport400OverallErrors,
} from "../../templates/errors/CSVImportErrors";
import { FileUploadHandlerEvent } from "primereact/fileupload";
import { internalToExternalDate } from "../../util/DateOps";
import CSVUploader from "../../components/uploaders/CSVFileUploader";
import CSVEndUserDocButton from "../../components/buttons/CSVEndUserDocButton";
import AddRowButton from "../../components/buttons/AddRowButton";
import ConfirmPopup from "../../components/popups/ConfirmPopup";
import EditCancelButton from "../../components/buttons/EditCancelDetailButton";
import Restricted from "../../permissions/Restricted";

interface BackupDataStoreSR {
  date: Date;
  sales: LineItem[];
  totalRevenue: number;
}

const EMPTY_ORIGINAL_DATA: BackupDataStoreSR = {
  date: new Date(),
  sales: [],
  totalRevenue: 0,
};

export default function SRDetail() {
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
  const [sales, setSales] = useImmer<LineItem[]>([]);
  const [creatorName, setCreatorName] = useState<string | undefined>("");

  const [originalData, setOriginalData] =
    useState<BackupDataStoreSR>(EMPTY_ORIGINAL_DATA);

  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] =
    useState<boolean>(false);
  const [hasUploadedCSV, setHasUploadedCSV] = useState<boolean>(false);
  const [deletePopupVisible, setDeletePopupVisible] = useState<boolean>(false); // Whether the delete popup is shown
  const [isGoBackActive, setIsGoBackActive] = useState<boolean>(false);
  const [isPageDeleteable, setIsPageDeleteable] = useState<boolean>(true);
  const [isSalesRecord, setIsSalesRecord] = useState<boolean>(id !== undefined);

  // Load the SR data on page load
  useEffect(() => {
    if (!isSRAddPage) {
      SALES_API.getSalesRecordsDetail({ id: id! })
        .then((response) => {
          const salesRecord = APIToInternalSRConversion(response);
          setDate(salesRecord.date);
          setIsSalesRecord(salesRecord.isSalesRecord);
          setSales(salesRecord.sales);
          setTotalRevenue(salesRecord.totalRevenue);
          setIsPageDeleteable(salesRecord.isDeletable);
          setCreatorName(salesRecord.creatorName);
          setOriginalData({
            date: salesRecord.date,
            totalRevenue: salesRecord.totalRevenue,
            sales: salesRecord.sales,
          });
        })
        .catch(() => showFailure(toast, "Could not fetch sales data"));
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

  // Called to make delete pop up show
  const deleteSalesRecordPopup = () => {
    logger.debug("Delete Sales Record Clicked");
    setDeletePopupVisible(true);
  };

  // Call to actually delete the element
  const deleteSalesRecordFinal = () => {
    logger.debug("Delete Sales Record Finalized");
    setDeletePopupVisible(false);
    SALES_API.deleteSalesRecord({
      id: id!,
    })
      .then(() => {
        showSuccess(
          toast,
          isSalesRecord
            ? "Sales Record Deleted"
            : "Sales Reconciliation Deleted"
        );
        navigate("/sales-records");
      })
      .catch(() =>
        showFailure(
          toast,
          isSalesRecord
            ? "Sales Record Failed to Delete"
            : "Sales Reconciliation Failed to Delete"
        )
      );
  };

  // The navigator to switch pages
  const navigate = useNavigate();

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
          showWarning(toast, CSVImport200OverallErrors(warning));
        }
      })
      .catch((error) => {
        showFailuresFunctionCaller(
          toast,
          error.data.errors,
          CSVImport400OverallErrors
        );
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

  const resetPageInputFields = () => {
    setSales([]);
    setDate(new Date());
    setTotalRevenue(0);
    setHasUploadedCSV(false);
    setIsGoBackActive(false);
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
        isGoBackActive ? navigate("/sales-records") : resetPageInputFields();
      })
      .catch((error) => {
        showFailure(
          toast,
          error.data.errors[0] ?? "Could not add sales reconciliation"
        );
      });
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
        setOriginalData({
          date: date,
          totalRevenue: totalRevenue,
          sales: sales,
        });
      })
      .catch(() => showFailure(toast, "Could not modify sales reconciliation"));
  };

  // -------- TEMPLATES/VISUAL ELEMENTS --------
  const toast = useRef<Toast>(null);

  // Top Line

  const titleText = (
    <div className="pt-2 p-2" style={{ width: "40%" }}>
      <AddDetailModifyTitle
        isModifyPage={isModifiable}
        isAddPage={isSRAddPage}
        detailTitle={
          isSalesRecord
            ? "Sales Record Details"
            : "Sales Reconciliation Details"
        }
        addTitle={"Add Sales Reconciliation"}
        modifyTitle={"Modify Sales Reconciliation"}
      />
    </div>
  );

  const backButton = (
    <div className="flex p-2" style={{ width: "30%" }}>
      <BackButton className="ml-1" />
    </div>
  );

  const deleteButton = (
    <DeleteButton
      visible={!isSRAddPage}
      disabled={!isPageDeleteable}
      onClick={deleteSalesRecordPopup}
    />
  );

  const deletePopup = (
    <DeletePopup
      deleteItemIdentifier={" this sales record"}
      onConfirm={() => deleteSalesRecordFinal()}
      setIsVisible={setDeletePopupVisible}
    />
  );

  // Toolbar

  // Left
  const addRowButton = (
    <AddRowButton
      emptyItem={emptyLineItem}
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

  const csvGuideButton = (
    <div className="ml-1">
      <CSVEndUserDocButton visible={isModifiable} toast={toast} />
    </div>
  );

  // Center
  const editCancelButton = (
    <EditCancelButton
      onClickEdit={() => setIsModifiable(!isModifiable)}
      onClickCancel={() => {
        setIsModifiable(!isModifiable);
        setDate(originalData.date);
        setTotalRevenue(originalData.totalRevenue);
        setSales(originalData.sales);
      }}
      isAddPage={isSRAddPage}
      isModifiable={isModifiable}
      visible={!isSalesRecord}
      className="my-auto p-button-sm mr-1"
    />
  );

  // Right
  const submitButton = (
    <ConfirmPopup
      isButtonVisible={isModifiable}
      isPopupVisible={isConfirmationPopupVisible}
      onHide={() => setIsConfirmationPopupVisible(false)}
      onFinalSubmission={onSubmit}
      onShowPopup={() => setIsConfirmationPopupVisible(true)}
      disabled={!isModifiable}
      buttonLabel={isSRAddPage ? "Submit & Add More" : "Submit"}
      className="p-button-success ml-2"
    />
  );

  const submitAndGoBackButton = (
    <ConfirmPopup
      isButtonVisible={isModifiable && isSRAddPage}
      isPopupVisible={isConfirmationPopupVisible && isModifiable && isSRAddPage}
      onHide={() => setIsConfirmationPopupVisible(false)}
      onFinalSubmission={onSubmit}
      onRejectFinalSubmission={() => {
        setIsGoBackActive(false);
      }}
      onShowPopup={() => {
        setIsConfirmationPopupVisible(true);
        setIsGoBackActive(true);
      }}
      disabled={!isModifiable}
      buttonLabel={"Submit & Go Back"}
      className="p-button-success ml-2"
    />
  );

  const rightToolbar = (
    <Restricted to={"modify"}>
      <div className="flex justify-content-end">
        {submitAndGoBackButton}
        {submitButton}
      </div>
    </Restricted>
  );

  const rightButtons = (
    <div className="flex justify-content-end p-2" style={{ width: "30%" }}>
      {editCancelButton}
      {deleteButton}
    </div>
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

  const tableHeader = (
    <Restricted to={"modify"}>
      {!isSalesRecord && (
        <div className="flex">
          {addRowButton}
          {csvImportButton}
          {csvGuideButton}
        </div>
      )}
    </Restricted>
  );

  const dataTable = (
    <LineItemTableTemplate
      lineItems={sales}
      setLineItems={setSales}
      priceColumnHeader={"Unit Retail Price"}
      isCSVErrorsColumnShowing={hasUploadedCSV}
      setTotalDollars={setTotalRevenue}
      isAddPage={isSRAddPage}
      isModifiable={isModifiable}
      getPriceForNewlySelectedBook={(title) =>
        Promise.resolve(booksMap.get(title)!.retailPrice)
      }
      booksDropdownTitles={booksDropdownTitles}
      tableHeader={tableHeader}
    />
  );

  return (
    <div>
      <Toast ref={toast} />
      <div className="grid flex justify-content-center">
        <div className="flex col-12 p-0">
          {backButton}
          {titleText}
          {rightButtons}
        </div>
        <div className="col-11">
          <form id="localForm">
            <div className="flex col-12 justify-content-evenly mb-3">
              {!isSRAddPage && !isSalesRecord && (
                <div className="flex">
                  <label
                    htmlFor="creatorname"
                    className="p-component text-teal-900 p-text-secondary my-auto pr-2"
                  >
                    Associated User:
                  </label>
                  <p className="p-component p-text-secondary text-900 text-xl text-center my-auto">
                    {creatorName}
                  </p>
                </div>
              )}
              {totalDollars}
              {calendar}
              {isModifiable && !isSalesRecord && rightToolbar}
            </div>
            {dataTable}
          </form>
        </div>
        {deletePopupVisible && deletePopup}
      </div>
    </div>
  );
}
