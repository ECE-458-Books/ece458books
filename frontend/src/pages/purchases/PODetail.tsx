import React, { useEffect, useRef, useState } from "react";
import ConfirmPopup from "../../components/popups/ConfirmPopup";
import { useNavigate, useParams } from "react-router-dom";
import {
  AddPOReq,
  APIPOPurchaseRow,
  ModifyPOReq,
  PURCHASES_API,
} from "../../apis/purchases/PurchasesAPI";
import { internalToExternalDate } from "../../util/DateOps";
import { Toast } from "primereact/toast";
import { FileUploadHandlerEvent } from "primereact/fileupload";
import {
  APIToInternalPOConversion,
  APIToInternalPurchasesCSVConversion,
} from "../../apis/purchases/PurchasesConversions";
import CSVUploader from "../../components/uploaders/CSVFileUploader";
import VendorDropdown from "../../components/dropdowns/VendorDropdown";
import { BooksDropdownData } from "../../components/dropdowns/BookDropdown";
import {
  showFailure,
  showFailuresFunctionCaller,
  showSuccess,
  showWarning,
} from "../../components/Toast";
import {
  CSVImport200OverallErrors,
  CSVImport400OverallErrors,
} from "../../templates/errors/CSVImportErrors";
import { Book } from "../books/BookList";
import { useImmer } from "use-immer";
import { logger } from "../../util/Logger";
import DeletePopup from "../../components/popups/DeletePopup";
import AddDetailModifyTitle from "../../components/text/AddDetailModifyTitle";
import BackButton from "../../components/buttons/BackButton";
import DeleteButton from "../../components/buttons/DeleteButton";
import AddRowButton from "../../components/buttons/AddRowButton";
import EditCancelButton from "../../components/buttons/EditCancelDetailButton";
import TotalDollars from "../../components/text/TotalDollars";
import OneDayCalendar from "../../components/OneDayCalendar";
import "../../css/TableCell.css";
import CSVEndUserDocButton from "../../components/buttons/CSVEndUserDocButton";
import LineItemTableTemplate, {
  emptyLineItem,
  LineItem,
} from "../../templates/inventorydetail/LineItemTableTemplate";
import Restricted from "../../permissions/Restricted";

interface BackupDataStorePO {
  date: Date;
  vendorName: string;
  purchases: LineItem[];
  totalCost: number;
}

const EMPTY_ORIGINAL_DATA: BackupDataStorePO = {
  date: new Date(),
  vendorName: "",
  purchases: [],
  totalCost: 0,
};

export default function PODetail() {
  // -------- STATE --------

  // From URL
  const { id } = useParams();
  const isPOAddPage = id === undefined;
  const [isModifiable, setIsModifiable] = useState<boolean>(id === undefined);

  // For Dropdown Menus
  const [booksMap, setBooksMap] = useState<Map<string, Book>>(new Map());
  const [vendorMap, setVendorMap] = useState<Map<string, number>>(new Map());
  const [booksDropdownTitles, setBooksDropdownTitles] = useState<string[]>([]);

  // The rest of the data
  const [date, setDate] = useState<Date>(new Date());
  const [creatorName, setCreatorName] = useState<string>("");
  const [selectedVendorName, setSelectedVendorName] = useState<string>("");

  const [originalData, setOriginalData] =
    useState<BackupDataStorePO>(EMPTY_ORIGINAL_DATA);

  // useImmer is used to set state for nested data in a simplified format
  const [purchases, setPurchases] = useImmer<LineItem[]>([]);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] =
    useState<boolean>(false);
  const [hasUploadedCSV, setHasUploadedCSV] = useState<boolean>(false);
  const [deletePopupVisible, setDeletePopupVisible] = useState<boolean>(false); // Whether the delete popup is shown
  const [isGoBackActive, setIsGoBackActive] = useState<boolean>(false);
  const [isPageDeleteable, setIsPageDeleteable] = useState<boolean>(true);

  // Load the PO data on page load
  useEffect(() => {
    if (!isPOAddPage) {
      PURCHASES_API.getPurchaseOrderDetail({ id: id! })
        .then((response) => {
          const purchaseOrder = APIToInternalPOConversion(response);
          setDate(purchaseOrder.date);
          setSelectedVendorName(purchaseOrder.vendorName);
          setPurchases(purchaseOrder.purchases);
          setTotalCost(purchaseOrder.totalCost);
          setIsPageDeleteable(purchaseOrder.isDeletable);
          setCreatorName(purchaseOrder.creatorName);
          setOriginalData({
            date: purchaseOrder.date,
            vendorName: purchaseOrder.vendorName,
            totalCost: purchaseOrder.totalCost,
            purchases: purchaseOrder.purchases,
          });
        })
        .catch(() => showFailure(toast, "Could not fetch purchase order data"));
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

  // -------- METHODS --------

  // Called to make delete pop up show
  const deletePurchaseOrderPopup = () => {
    logger.debug("Delete Purchase Order Clicked");
    setDeletePopupVisible(true);
  };

  // Call to actually delete the element
  const deletePurchaseOrderFinal = () => {
    logger.debug("Edit Purchase Order Finalized");
    setDeletePopupVisible(false);
    PURCHASES_API.deletePurchaseOrder({
      id: id!,
    })
      .then(() => {
        showSuccess(toast, "Purchase Order Deleted");
        navigate("/purchase-orders");
      })
      .catch(() => showFailure(toast, "Purchase Order Failed to Delete"));
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

  // The navigator to switch pages
  const navigate = useNavigate();

  const validateSubmission = () => {
    for (const purchase of purchases) {
      if (!purchase.bookTitle || !(purchase.price >= 0) || !purchase.quantity) {
        showFailure(
          toast,
          "Book, wholesale, and quantity are required for all line items"
        );
        return false;
      }
    }

    if (!date || !selectedVendorName) {
      showFailure(toast, "Date and vendor are required fields");
      return false;
    }

    return true;
  };

  const resetPageInputFields = () => {
    setSelectedVendorName("");
    setPurchases([]);
    setDate(new Date());
    setTotalCost(0);
    setHasUploadedCSV(false);
    setIsGoBackActive(false);
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
        book: Number(booksMap.get(purchase.bookTitle)?.id),
        quantity: purchase.quantity,
        unit_wholesale_price: purchase.price,
      } as APIPOPurchaseRow;
    });

    const purchaseOrder = {
      date: internalToExternalDate(date),
      vendor: vendorMap.get(selectedVendorName),
      purchases: apiPurchases,
    } as AddPOReq;

    PURCHASES_API.addPurchaseOrder(purchaseOrder)
      .then(() => {
        showSuccess(toast, "Purchase order added successfully");
        isGoBackActive ? navigate("/purchase-orders") : resetPageInputFields();
      })
      .catch(() => showFailure(toast, "Could not add purchase order"));
  }

  // Modify the purchase order
  function callModifyPOAPI() {
    const apiPurchases = purchases.map((purchase) => {
      return {
        id: purchase.isNewRow ? undefined : purchase.id,
        quantity: purchase.quantity,
        // If the book has been deleted, will have to use the id that is already present in the row
        book: booksMap.get(purchase.bookTitle)?.id ?? purchase.bookId,
        unit_wholesale_price: purchase.price,
      } as APIPOPurchaseRow;
    });

    const purchaseOrder = {
      id: id,
      date: internalToExternalDate(date),
      vendor: vendorMap.get(selectedVendorName),
      purchases: apiPurchases,
    } as ModifyPOReq;

    PURCHASES_API.modifyPurchaseOrder(purchaseOrder)
      .then(() => {
        showSuccess(toast, "Purchase order modified successfully");
        setIsModifiable(!isModifiable);
        setOriginalData({
          date: date,
          vendorName: selectedVendorName,
          totalCost: totalCost,
          purchases: purchases,
        });
      })
      .catch(() => showFailure(toast, "Could not modify purchase order"));
  }

  // -------- TEMPLATES/VISUAL ELEMENTS --------

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  // Top Line

  const titleText = (
    <div className="pt-2 col-4">
      <AddDetailModifyTitle
        isModifyPage={isModifiable}
        isAddPage={isPOAddPage}
        detailTitle={"Purchase Order Details"}
        addTitle={"Add Purchase Order"}
        modifyTitle={"Modify Purchase Order"}
      />
    </div>
  );

  const backButton = (
    <div className="flex col-4">
      <BackButton className="ml-1" />
    </div>
  );

  const deleteButton = (
    <DeleteButton
      visible={!isPOAddPage}
      disabled={!isPageDeleteable}
      onClick={deletePurchaseOrderPopup}
    />
  );

  const deletePopup = (
    <DeletePopup
      deleteItemIdentifier={"this purchase order"}
      onConfirm={deletePurchaseOrderFinal}
      setIsVisible={setDeletePopupVisible}
    />
  );

  // Toolbar

  // Left
  const addRowButton = (
    <AddRowButton
      emptyItem={emptyLineItem}
      rows={purchases}
      setRows={setPurchases}
      isDisabled={!isModifiable}
      label={"Add Book"}
      isVisible={isModifiable}
    />
  );

  const csvGuideButton = (
    <div className="ml-1">
      <CSVEndUserDocButton visible={isModifiable} toast={toast} />
    </div>
  );

  const csvImportButton = (
    <CSVUploader visible={isModifiable} uploadHandler={csvUploadHandler} />
  );

  const tableHeader = (
    <Restricted to={"modify"}>
      <div className="flex">
        {addRowButton}
        {csvImportButton}
        {csvGuideButton}
      </div>
    </Restricted>
  );

  // Center
  const editCancelButton = (
    <EditCancelButton
      onClickEdit={() => {
        setIsModifiable(!isModifiable);
      }}
      onClickCancel={() => {
        setIsModifiable(!isModifiable);
        setDate(originalData.date);
        setSelectedVendorName(originalData.vendorName);
        setTotalCost(originalData.totalCost);
        setPurchases(originalData.purchases);
      }}
      isAddPage={isPOAddPage}
      isModifiable={isModifiable}
      className="my-auto p-button-sm mr-1"
    />
  );

  const checkForNecessaryValues = (): boolean => {
    return purchases.length == 0 || selectedVendorName === "";
  };

  // Right
  const submitButton = (
    <ConfirmPopup
      isButtonVisible={isModifiable}
      isPopupVisible={isConfirmationPopupVisible}
      onHide={() => setIsConfirmationPopupVisible(false)}
      onFinalSubmission={onSubmit}
      onShowPopup={() => setIsConfirmationPopupVisible(true)}
      disabled={!isModifiable || checkForNecessaryValues()}
      buttonLabel={isPOAddPage ? "Submit & Add More" : "Submit"}
      className="p-button-success ml-2"
    />
  );

  const submitAndGoBackButton = (
    <ConfirmPopup
      isButtonVisible={isModifiable && isPOAddPage}
      isPopupVisible={isConfirmationPopupVisible && isModifiable && isPOAddPage}
      onHide={() => setIsConfirmationPopupVisible(false)}
      onFinalSubmission={onSubmit}
      onRejectFinalSubmission={() => {
        setIsGoBackActive(false);
      }}
      onShowPopup={() => {
        setIsConfirmationPopupVisible(true);
        setIsGoBackActive(true);
      }}
      disabled={!isModifiable || checkForNecessaryValues()}
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

  // Items below toolbar
  const totalDollars = (
    <div className="flex">
      <TotalDollars label={"Total Cost:"} totalDollars={totalCost} />
    </div>
  );

  const calendar = (
    <OneDayCalendar disabled={!isModifiable} date={date} setDate={setDate} />
  );

  const vendorDropdown = (
    <VendorDropdown
      setVendorMap={setVendorMap}
      setSelectedVendor={setSelectedVendorName}
      selectedVendor={selectedVendorName}
      isModifiable={isModifiable}
    />
  );

  const rightButtons = (
    <div className="flex col-4 justify-content-end">
      {editCancelButton}
      {deleteButton}
    </div>
  );

  // Datatable
  const dataTable = (
    <LineItemTableTemplate
      lineItems={purchases}
      setLineItems={setPurchases}
      priceColumnHeader={"Unit Wholesale Price"}
      isCSVErrorsColumnShowing={hasUploadedCSV}
      setTotalDollars={setTotalCost}
      isAddPage={isPOAddPage}
      isModifiable={isModifiable}
      getPriceForNewlySelectedBook={() => Promise.resolve(0)}
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
          <form onSubmit={onSubmit}>
            <div className="flex col-12 justify-content-evenly mb-3">
              {!isPOAddPage && (
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
              <div className="flex">
                <label
                  htmlFor="vendor"
                  className="p-component text-teal-900 p-text-secondary my-auto pr-2"
                >
                  Vendor:
                </label>
                {isModifiable ? (
                  vendorDropdown
                ) : (
                  <p className="p-component p-text-secondary text-900 text-xl text-center my-auto">
                    {selectedVendorName}
                  </p>
                )}
              </div>
              {calendar}
              {isModifiable && rightToolbar}
            </div>
            {dataTable}
          </form>
        </div>
        {deletePopupVisible && deletePopup}
      </div>
    </div>
  );
}
