import { DataTable, DataTableRowClickEvent } from "primereact/datatable";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuid } from "uuid";
import { TableColumn, createColumns } from "../../components/TableColumns";
import {
  numberEditor,
  priceBodyTemplate,
  priceEditor,
} from "../../util/TableCellEditFuncs";
import {
  CSVImport200OverallErrors,
  CSVImport400Errors,
  CSVImport400OverallErrors,
  errorCellBody,
} from "./errors/CSVImportErrors";
import React from "react";
import ConfirmPopup from "../../components/popups/ConfirmPopup";
import {
  showFailure,
  showFailuresFunctionCaller,
  showFailuresMapper,
  showSuccess,
  showWarning,
} from "../../components/Toast";
import {
  APIBBSaleRow,
  AddBBReq,
  BUYBACK_API,
  ModifyBBReq,
} from "../../apis/BuyBackAPI";
import { internalToExternalDate } from "../../util/DateOperations";
import { filterById, findById } from "../../util/IDOperations";
import { calculateTotal } from "../../util/CalculateTotal";
import { Book } from "../list/BookList";

import { useImmer } from "use-immer";
import {
  APIToInternalBBConversion,
  APIToInternalBuybackCSVConversion,
} from "../../apis/Conversions";
import BooksDropdown, {
  BooksDropdownData,
} from "../../components/dropdowns/BookDropdown";
import { logger } from "../../util/Logger";
import DeletePopup from "../../components/popups/DeletePopup";
import AddDetailModifyTitle from "../../components/text/AddDetailModifyTitle";
import OneDayCalendar from "../../components/OneDayCalendar";
import TotalDollars from "../../components/text/TotalDollars";
import BackButton from "../../components/buttons/BackButton";
import DeleteButton from "../../components/buttons/DeleteButton";
import VendorDropdown from "../../components/dropdowns/VendorDropdown";
import DeleteColumn from "../../components/datatable/DeleteColumn";
import AddRowButton from "../../components/buttons/AddRowButton";
import EditCancelButton from "../../components/buttons/EditCancelDetailButton";
import { VENDORS_API } from "../../apis/VendorsAPI";
import { FileUploadHandlerEvent } from "primereact/fileupload";
import CSVUploader from "../../components/uploaders/CSVFileUploader";
import "../../css/TableCell.css";

export interface BBDetailState {
  id: number;
  isAddPage: boolean;
  isModifiable: boolean;
}

export interface BBSaleRow {
  isNewRow: boolean;
  id: string;
  bookId: number;
  bookISBN: string;
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
    bookISBN: "",
    bookTitle: "",
    quantity: 1,
    price: 0,
  };

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
  const [booksDropdownTitles, setBooksDropdownTitles] = useState<string[]>([]);

  // The rest of the data
  const [date, setDate] = useState<Date>(new Date());
  const [selectedVendorName, setSelectedVendorName] = useState<string>("");

  // useImmer is used to set state for nested data in a simplified format
  const [buybacks, setBuybacks] = useImmer<BBSaleRow[]>([]);
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
        setBookTitlesList: setBooksDropdownTitles,
        vendor: vendorMap.get(selectedVendorName)!,
      }),
    [selectedVendorName]
  );

  useEffect(() => {
    setIsBooksBuyBackSold(buybacks.length > 0);
  }, [buybacks]);

  const COLUMNS: TableColumn[] = [
    {
      field: "errors",
      header: "Errors",
      hidden: !hasUploadedCSV,
      customBody: (rowData: BBSaleRow) => errorCellBody(rowData.errors),
      style: { minWidth: "8rem" },
    },
    {
      field: "bookTitle",
      header: "Book",
      customBody: (rowData: BBSaleRow) =>
        booksDropDownEditor(
          rowData.bookTitle,
          (newValue) => {
            updateRowOnTitleChange(rowData, newValue);
          },
          !isModifiable
        ),
    },
    {
      field: "quantity",
      header: "Quantity",
      customBody: (rowData: BBSaleRow) =>
        numberEditor(
          rowData.quantity,
          (newValue) => {
            setBuybacks((draft) => {
              const sale = findById(draft, rowData.id);
              sale!.quantity = newValue;
              setTotalRevenue(calculateTotal(draft));
            });
          },
          "integernumberPODetail",
          !isModifiable
        ),
      style: { minWidth: "8rem" },
    },
    {
      field: "price",
      header: "Unit Buyback Price ($)",
      customBody: (rowData: BBSaleRow) =>
        priceEditor(
          rowData.price,
          (newValue) => {
            setBuybacks((draft) => {
              const sale = findById(draft, rowData.id);
              sale!.price = newValue;
              setTotalRevenue(calculateTotal(draft));
            });
          },
          "retailnumberPODetail",
          !isModifiable
        ),
      style: { minWidth: "10rem" },
    },
    {
      field: "subtotal",
      header: "Subtotal ($)",
      customBody: (rowData: BBSaleRow) =>
        priceBodyTemplate(rowData.price * rowData.quantity),
      style: { minWidth: "8rem" },
    },
  ];

  const updateRowOnTitleChange = (rowData: BBSaleRow, newBookTitle: string) => {
    VENDORS_API.bestBuybackPrice({
      bookid: booksMap.get(newBookTitle)!.id,
      vendor_id: vendorMap.get(selectedVendorName)!.toString(),
    })
      .then((response) => {
        setBuybacks((draft) => {
          const sale = findById(draft, rowData.id)!;
          sale.bookTitle = newBookTitle;
          sale.price = response;
          setTotalRevenue(calculateTotal(draft));
        });
      })
      .catch(() => {
        showFailure(toast, "Could not fetch best buyback price");
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

  const onRowClick = (event: DataTableRowClickEvent) => {
    const sale = event.data as BBSaleRow;
    logger.debug("Purchase Order Row Clicked", sale);
    toBookDetailsPage(sale);
  };

  // Callback functions for edit/delete buttons
  const toBookDetailsPage = (sale: BBSaleRow) => {
    logger.debug("Edit Book Clicked", sale);
    navigate(`/books/detail/${sale.bookId}`);
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
      .catch(() => showFailure(toast, "Could not add book buyback"));
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
      <BackButton onClick={() => navigate("/book-buybacks")} className="ml-1" />
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
      emptyItem={emptySale}
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

  const leftToolbar = (
    <>
      {addRowButton}
      {csvImportButton}
    </>
  );

  // Center
  const editCancelButton = (
    <EditCancelButton
      onClickEdit={() => {
        setIsModifiable(!isModifiable);
        BooksDropdownData({
          setBooksMap: setBooksMap,
          setBookTitlesList: setBooksDropdownTitles,
          vendor: vendorMap.get(selectedVendorName)!,
        });
      }}
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

  // Datatable Items

  const columns = createColumns(COLUMNS);

  const booksDropDownEditor = (
    value: string,
    onChange: (newValue: string) => void,
    isDisabled?: boolean
  ) => (
    <BooksDropdown
      setSelectedBook={onChange}
      selectedBook={value}
      bookTitlesList={booksDropdownTitles}
      isDisabled={isDisabled}
      placeholder={value}
    />
  );

  // Delete icon for each row
  const deleteColumn = DeleteColumn<BBSaleRow>({
    onDelete: (rowData) => {
      const newSales = filterById(buybacks, rowData.id, setBuybacks);
      setTotalRevenue(calculateTotal(newSales));
    },
    hidden: !isModifiable,
  });

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
            <Toolbar
              className="mb-4"
              left={leftToolbar}
              center={editCancelButton}
              right={rightToolbar}
            />

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

            <DataTable
              showGridlines
              value={buybacks}
              className="editable-cells-table"
              responsiveLayout="scroll"
              editMode="cell"
              rowHover={!isBBAddPage}
              selectionMode={"single"}
              onRowClick={(event) => {
                if (!isBBAddPage && !isModifiable) {
                  onRowClick(event);
                }
              }}
            >
              {columns}
              {deleteColumn}
            </DataTable>
          </form>
        </div>
        {deletePopupVisible && deletePopup}
      </div>
    </div>
  );
}
