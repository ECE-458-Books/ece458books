import { Toast } from "primereact/toast";
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
import { Book, emptyBook } from "../books/BookList";

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
import { Bookcase } from "./BookcaseList";
import { CASE_DESIGNER_API } from "../../apis/casedesigner/CaseDesignerAPI";
import {
  APIToInternalBookcaseConversion,
  InternalToAPIBookcaseConversion,
} from "../../apis/casedesigner/CaseDesignerConversions";

const emptyBookcase: Bookcase = {
  id: "",
  name: "",
  width: 0,
  creator: "",
  lastEditDate: new Date(),
  lastEditor: "",
  shelves: [],
};

export default function BookcaseDetail() {
  // -------- STATE --------
  // From URL
  const { id } = useParams();
  const isAddPage = id === undefined;
  const [isModifiable, setIsModifiable] = useState<boolean>(id === undefined);

  // The navigator to switch pages
  const navigate = useNavigate();

  // For dropdown menus
  const [booksMap, setBooksMap] = useState<Map<string, Book>>(new Map());
  const [originalData, setOriginalData] = useState<Bookcase>(emptyBookcase);

  // useImmer is used to set state for nested data in a simplified format
  const [bookcase, setBookcase] = useImmer<Bookcase>(emptyBookcase);
  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] =
    useState<boolean>(false);
  const [deletePopupVisible, setDeletePopupVisible] = useState<boolean>(false);
  const [isGoBackActive, setIsGoBackActive] = useState<boolean>(false);
  const [isPageDeleteable, setIsPageDeleteable] = useState<boolean>(true);

  // Load the Bookcase data on page load
  useEffect(() => {
    if (!isAddPage) {
      CASE_DESIGNER_API.getBookcaseDetail(id)
        .then((response) => {
          const bookcase = APIToInternalBookcaseConversion(response);
          setOriginalData(bookcase);
          setBookcase(bookcase);
        })
        .catch(() => showFailure(toast, "Could not fetch bookcase data"));
    }
  }, []);

  // Get the data for the books dropdown
  useEffect(
    () =>
      BooksDropdownData({
        setBooksMap: setBooksMap,
      }),
    []
  );

  // Call to delete the bookcase
  const deleteBuyBackFinal = () => {
    logger.debug("Delete Bookcase Finalized");
    setDeletePopupVisible(false);
    CASE_DESIGNER_API.deleteBookcase(id!)
      .then(() => {
        showSuccess(toast, "Bookcase deleted");
        navigate("/bookcase");
      })
      .catch(() => showFailure(toast, "Failed to delete bookcase"));
  };

  const onSubmit = (): void => {
    if (isAddPage) {
      callAddBookcaseAPI();
    } else {
      callModifyBookcaseAPI();
    }
  };

  const callAddBookcaseAPI = () => {
    const APIbookcase = InternalToAPIBookcaseConversion(bookcase);
    CASE_DESIGNER_API.addBookcase(APIbookcase)
      .then(() => {
        showSuccess(toast, "Bookcase added successfully");
        isGoBackActive ? navigate("/bookcase") : window.location.reload();
      })
      .catch((error) => {
        showFailure(toast, error.data.errors[0] ?? "Failed to add bookcase");
      });
  };

  const callModifyBookcaseAPI = () => {
    const APIbookcase = InternalToAPIBookcaseConversion(bookcase);
    // DEAL WITH THE FACT THAT ID IS UNDEFINED
    CASE_DESIGNER_API.modifyBookcase(APIbookcase)
      .then(() => {
        showSuccess(toast, "Bookcase added successfully");
        isGoBackActive ? navigate("/bookcase") : window.location.reload();
      })
      .catch((error) => {
        showFailure(toast, error.data.errors[0] ?? "Failed to add bookcase");
      });
  };

  // -------- TEMPLATES/VISUAL ELEMENTS --------
  const toast = useRef<Toast>(null);

  // Top Line
  const titleText = (
    <div className="pt-2 col-4">
      <AddDetailModifyTitle
        isModifyPage={isModifiable}
        isAddPage={isAddPage}
        detailTitle={"Book Buyback Details"}
        addTitle={"Add Book Buyback"}
        modifyTitle={"Modify Book Buyback"}
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
      visible={!isAddPage}
      disabled={!isPageDeleteable}
      onClick={setDeletePopupVisible(true)}
    />
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

  // Center
  const editCancelButton = (
    <EditCancelButton
      onClickEdit={() => setIsModifiable(!isModifiable)}
      onClickCancel={() => {
        setIsModifiable(!isModifiable);
        setDate(originalData.date);
        setSelectedVendorName(originalData.vendorName);
        setTotalRevenue(originalData.totalRevenue);
        setBuybacks(originalData.buybacks);
      }}
      isAddPage={isAddPage}
      isModifiable={isModifiable}
      className="my-auto p-button-sm mr-1"
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
      isButtonVisible={isModifiable && isAddPage}
      isPopupVisible={isConfirmationPopupVisible && isModifiable && isAddPage}
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

  const rightButtons = (
    <div className="flex col-4 justify-content-end">
      {editCancelButton}
      {deleteButton}
    </div>
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

  // Datatable

  const dataTable = (
    <LineItemTableTemplate
      lineItems={buybacks}
      setLineItems={setBuybacks}
      priceColumnHeader={"Unit Buyback Price"}
      isCSVErrorsColumnShowing={hasUploadedCSV}
      setTotalDollars={setTotalRevenue}
      isAddPage={isAddPage}
      isModifiable={isModifiable}
      getPriceForNewlySelectedBook={(title) => getBestBuybackPrice(title)}
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
