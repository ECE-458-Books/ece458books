import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CSVImport200OverallErrors,
  CSVImport400OverallErrors,
} from "../../templates/errors/CSVImportErrors";
import React from "react";
import ConfirmPopup from "../../components/popups/ConfirmPopup";
import {
  showFailure,
  showFailuresFunctionCaller,
  showSuccess,
  showWarning,
} from "../../components/Toast";
import {
  APIBBSaleRow,
  AddBBReq,
  BUYBACK_API,
  ModifyBBReq,
} from "../../apis/buybacks/BuyBackAPI";
import { internalToExternalDate } from "../../util/DateOps";
import { Book } from "../books/BookList";

import { useImmer } from "use-immer";
import {
  APIToInternalBBConversion,
  APIToInternalBuybackCSVConversion,
} from "../../apis/buybacks/BuybacksConversions";
import { BooksDropdownData } from "../../components/dropdowns/BookDropdown";
import { logger } from "../../util/Logger";
import DeletePopup from "../../components/popups/DeletePopup";
import AddDetailModifyTitle from "../../components/text/AddDetailModifyTitle";
import OneDayCalendar from "../../components/OneDayCalendar";
import TotalDollars from "../../components/text/TotalDollars";
import BackButton from "../../components/buttons/BackButton";
import DeleteButton from "../../components/buttons/DeleteButton";
import VendorDropdown from "../../components/dropdowns/VendorDropdown";
import AddRowButton from "../../components/buttons/AddRowButton";
import EditCancelButton from "../../components/buttons/EditCancelDetailButton";
import { VENDORS_API } from "../../apis/vendors/VendorsAPI";
import { FileUploadHandlerEvent } from "primereact/fileupload";
import CSVUploader from "../../components/uploaders/CSVFileUploader";
import "../../css/TableCell.css";
import CSVEndUserDocButton from "../../components/buttons/CSVEndUserDocButton";
import LineItemTableTemplate, {
  emptyLineItem,
  LineItem,
} from "../../templates/inventorydetail/LineItemTableTemplate";
import Restricted from "../../permissions/Restricted";

export default function BBDetail() {
  // -------- STATE --------
  // From URL
  const { id } = useParams();
  const isBBAddPage = id === undefined;
  const [isModifiable, setIsModifiable] = useState<boolean>(id === undefined);

  // The navigator to switch pages
  const navigate = useNavigate();

  // For dropdown menus
  const [booksMap, setBooksMap] = useState<Map<string, Book>>(new Map());
  const [vendorMap, setVendorMap] = useState<Map<string, number>>(new Map());

  // The rest of the data
  const [date, setDate] = useState<Date>(new Date());
  const [selectedVendorName, setSelectedVendorName] = useState<string>("");

  // useImmer is used to set state for nested data in a simplified format
  const [buybacks, setBuybacks] = useImmer<LineItem[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] =
    useState<boolean>(false);
  const [isBooksBuyBackSold, setIsBooksBuyBackSold] = useState<boolean>(false);
  const [hasUploadedCSV, setHasUploadedCSV] = useState<boolean>(false);
  const [deletePopupVisible, setDeletePopupVisible] = useState<boolean>(false); // Whether the delete popup is shown
  const [isGoBackActive, setIsGoBackActive] = useState<boolean>(false);
  const [isPageDeleteable, setIsPageDeleteable] = useState<boolean>(true);

  // Load the SR data on page load
  useEffect(() => {
    if (!isBBAddPage) {
      BUYBACK_API.getBuyBackDetail({ id: id! })
        .then((response) => {
          const buyBack = APIToInternalBBConversion(response);
          setDate(buyBack.date);
          setBuybacks(buyBack.sales);
          setTotalRevenue(buyBack.totalRevenue);
          setSelectedVendorName(buyBack.vendorName);
          setIsPageDeleteable(buyBack.isDeletable);
        })
        .catch(() =>
          showFailure(toast, "Could not fetch book buyback sales data")
        );
    }

    setIsBooksBuyBackSold(buybacks.length > 0);
  }, []);

  // Get the data for the books dropdown
  useEffect(
    () =>
      BooksDropdownData({
        setBooksMap: setBooksMap,
        vendor: vendorMap.get(selectedVendorName)!,
      }),
    [selectedVendorName]
  );

  useEffect(() => {
    setIsBooksBuyBackSold(buybacks.length > 0);
  }, [buybacks]);

  const getBestBuybackPrice = (newBookTitle: string) => {
    return VENDORS_API.bestBuybackPrice({
      bookid: booksMap.get(newBookTitle)!.id,
      vendor_id: vendorMap.get(selectedVendorName)!.toString(),
    })
      .then((response) => {
        return response;
      })
      .catch(() => {
        return 0;
      });
  };

  // Called to make delete pop up show
  const deleteBuyBackPopup = () => {
    logger.debug("Delete Sales Reconciliation Clicked");
    setDeletePopupVisible(true);
  };

  // Call to actually delete the element
  const deleteBuyBackFinal = () => {
    logger.debug("Delete Book BuyBack Finalized");
    setDeletePopupVisible(false);
    BUYBACK_API.deleteBuyBack({
      id: id!,
    })
      .then(() => {
        showSuccess(toast, "Book BuyBack Sale Deleted");
        navigate("/book-buybacks");
      })
      .catch(() => showFailure(toast, "Book BuyBack Sale Failed to Delete"));
  };

  // Handler for a CSV upload
  const csvUploadHandler = (event: FileUploadHandlerEvent) => {
    const csv = event.files[0];
    BUYBACK_API.buybackCSVImport({
      file: csv,
      vendor: vendorMap.get(selectedVendorName)!.toString(),
    })
      .then((response) => {
        const buybacks = APIToInternalBuybackCSVConversion(response.buybacks);
        setBuybacks(buybacks);
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
    for (const sale of buybacks) {
      if (!sale.bookTitle || !(sale.price >= 0) || !sale.quantity) {
        showFailure(
          toast,
          "Book, buyback price, and quantity are required for all line items"
        );
        return false;
      }
    }

    if (!date) {
      showFailure(toast, "Date and vendor are required fields");
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

  // Add the book buyback
  const callAddBBAPI = () => {
    const apiSales = buybacks.map((sale) => {
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
      .then(() => {
        showSuccess(toast, "Book Buyback added successfully");
        isGoBackActive ? navigate("/book-buybacks") : window.location.reload();
      })
      .catch((error) => {
        showFailure(
          toast,
          error.data.errors[0] ?? "Failed to add book buyback"
        );
      });
  };

  // Modify the sales reconciliation
  const callModifyBBAPI = () => {
    // Otherwise, it is a modify page
    const apiSales = buybacks.map((sale) => {
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
      .then(() => {
        showSuccess(toast, "Book Buyback modified successfully");
        setIsModifiable(!isModifiable);
      })
      .catch(() => showFailure(toast, "Could not modify book buyback"));
  };

  // -------- TEMPLATES/VISUAL ELEMENTS --------
  const toast = useRef<Toast>(null);

  // Top Line
  const titleText = (
    <div className="pt-2 col-10">
      <AddDetailModifyTitle
        isModifyPage={isModifiable}
        isAddPage={isBBAddPage}
        detailTitle={"Book Buyback Details"}
        addTitle={"Add Book Buyback"}
        modifyTitle={"Modify Book Buyback"}
      />
    </div>
  );

  const backButton = (
    <div className="flex col-1">
      <BackButton className="ml-1" />
    </div>
  );

  const deleteButton = (
    <div className="flex col-1">
      <DeleteButton
        visible={!isBBAddPage}
        disabled={!isPageDeleteable}
        onClick={deleteBuyBackPopup}
      />
    </div>
  );

  const deletePopup = (
    <DeletePopup
      deleteItemIdentifier={"this book buyback"}
      onConfirm={() => deleteBuyBackFinal()}
      setIsVisible={setDeletePopupVisible}
    />
  );

  // Toolbar

  // Left
  const addRowButton = (
    <AddRowButton
      emptyItem={emptyLineItem}
      rows={buybacks}
      setRows={setBuybacks}
      isDisabled={!isModifiable || selectedVendorName == ""}
      label={"Add Book"}
      isVisible={isModifiable}
    />
  );

  const csvImportButton = (
    <CSVUploader
      visible={isModifiable}
      disabled={selectedVendorName == ""}
      uploadHandler={csvUploadHandler}
    />
  );

  const csvGuideButton = (
    <CSVEndUserDocButton visible={isModifiable} toast={toast} />
  );

  const leftToolbar = (
    <>
      {addRowButton}
      {csvImportButton}
      {csvGuideButton}
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
      isAddPage={isBBAddPage}
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
      isButtonVisible={isModifiable && isBBAddPage}
      isPopupVisible={isConfirmationPopupVisible && isModifiable && isBBAddPage}
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

  const vendorDropdown = (
    <VendorDropdown
      setVendorMap={setVendorMap}
      setSelectedVendor={setSelectedVendorName}
      selectedVendor={selectedVendorName}
      isModifiable={isModifiable && !isBooksBuyBackSold}
      hasBuybackPolicy={true}
    />
  );

  // Datatable

  const dataTable = (
    <LineItemTableTemplate
      lineItems={buybacks}
      setLineItems={setBuybacks}
      priceColumnHeader={"Unit Buyback Price"}
      isCSVErrorsColumnShowing={hasUploadedCSV}
      setTotalDollars={setTotalRevenue}
      isAddPage={isBBAddPage}
      isModifiable={isModifiable}
      getPriceForNewlySelectedBook={(title) => getBestBuybackPrice(title)}
    />
  );

  return (
    <div>
      <Toast ref={toast} />
      <div className="grid flex justify-content-center">
        <div className="flex col-12 p-0">
          {backButton}
          {titleText}
          {deleteButton}
        </div>
        <div className="col-11">
          <form onSubmit={onSubmit}>
            <Restricted to={"modify"}>
              <Toolbar
                className="mb-4"
                left={leftToolbar}
                center={editCancelButton}
                right={rightToolbar}
              />
            </Restricted>

            <div className="flex col-12 justify-content-evenly mb-3">
              {totalDollars}
              {calendar}
              <div>
                <label
                  htmlFor="vendor"
                  className="p-component text-teal-900 p-text-secondary my-auto pr-2"
                >
                  Vendor
                </label>
                {vendorDropdown}
              </div>
            </div>
            {dataTable}
          </form>
        </div>
        {deletePopupVisible && deletePopup}
      </div>
    </div>
  );
}
