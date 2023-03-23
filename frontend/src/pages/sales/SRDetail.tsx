import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SALES_API } from "../../apis/sales/SalesAPI";
import { Toast } from "primereact/toast";
import { BooksDropdownData } from "../../components/dropdowns/BookDropdown";
import { APIToInternalSRConversion } from "../../apis/sales/SalesConversions";
import { showFailure, showSuccess } from "../../components/Toast";
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
} from "../../templates/inventorydetail/LineItemTableTemplate";

export default function SRDetail() {
  // From URL
  const { id } = useParams();
  const isSRAddPage = false;
  const isModifiable = false;

  // For dropdown menus
  const [booksMap, setBooksMap] = useState<Map<string, Book>>(new Map());
  const [booksDropdownTitles, setBooksDropdownTitles] = useState<string[]>([]);

  // The rest of the data
  const [date, setDate] = useState<Date>(new Date());
  // useImmer is used to set state for nested data in a simplified format
  const [sales, setSales] = useImmer<LineItem[]>([]);

  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const hasUploadedCSV = false;
  const [deletePopupVisible, setDeletePopupVisible] = useState<boolean>(false); // Whether the delete popup is shown
  const [isPageDeleteable, setIsPageDeleteable] = useState<boolean>(true);

  // Load the SR data on page load
  useEffect(() => {
    SALES_API.getSalesRecordsDetail({ id: id! })
      .then((response) => {
        const salesRecord = APIToInternalSRConversion(response);
        setDate(salesRecord.date);
        setSales(salesRecord.sales);
        setTotalRevenue(salesRecord.totalRevenue);
        setIsPageDeleteable(salesRecord.isDeletable);
      })
      .catch(() => showFailure(toast, "Could not fetch sales record data"));
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
        showSuccess(toast, "Sales Record Deleted");
        navigate("/sales-records");
      })
      .catch(() => showFailure(toast, "Sales Record Failed to Delete"));
  };

  // The navigator to switch pages
  const navigate = useNavigate();

  // -------- TEMPLATES/VISUAL ELEMENTS --------
  const toast = useRef<Toast>(null);

  // Top Line

  const titleText = (
    <div className="pt-2 col-10">
      <AddDetailModifyTitle
        isModifyPage={isModifiable}
        isAddPage={isSRAddPage}
        detailTitle={"Sales Record Details"}
        addTitle={"Add Sales Record"}
        modifyTitle={"Modify Sales Record"}
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
        visible={!isSRAddPage}
        disabled={!isPageDeleteable}
        onClick={deleteSalesRecordPopup}
      />
    </div>
  );

  const deletePopup = (
    <DeletePopup
      deleteItemIdentifier={" this sales record"}
      onConfirm={() => deleteSalesRecordFinal()}
      setIsVisible={setDeletePopupVisible}
    />
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
    />
  );

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
            <div className="flex pb-2 flex-row justify-content-evenly card-container col-12">
              {totalDollars}
              {calendar}
            </div>
            {dataTable}
          </form>
        </div>
        {deletePopupVisible && deletePopup}
      </div>
    </div>
  );
}
