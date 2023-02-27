import React, { useEffect, useRef, useState } from "react";
import { DataTable, DataTableRowClickEvent } from "primereact/datatable";
import { createColumns, TableColumn } from "../../components/TableColumns";
import ConfirmPopup from "../../components/popups/ConfirmPopup";
import { Toolbar } from "primereact/toolbar";
import { v4 as uuid } from "uuid";
import {
  numberEditor,
  priceBodyTemplate,
  priceEditor,
} from "../../util/TableCellEditFuncs";
import { useNavigate, useParams } from "react-router-dom";
import {
  AddPOReq,
  APIPOPurchaseRow,
  ModifyPOReq,
  PURCHASES_API,
} from "../../apis/PurchasesAPI";
import { internalToExternalDate } from "../../util/DateOperations";
import { Toast } from "primereact/toast";
import { FileUploadHandlerEvent } from "primereact/fileupload";
import {
  APIToInternalPOConversion,
  APIToInternalPurchasesCSVConversion,
} from "../../apis/Conversions";
import CSVUploader from "../../components/uploaders/CSVFileUploader";
import VendorDropdown from "../../components/dropdowns/VendorDropdown";
import BooksDropdown, {
  BooksDropdownData,
} from "../../components/dropdowns/BookDropdown";
import {
  showFailure,
  showFailuresMapper,
  showSuccess,
  showWarningsMapper,
} from "../../components/Toast";
import {
  CSVImport200Errors,
  CSVImport400Errors,
  errorCellBody,
} from "./errors/CSVImportErrors";
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

export interface POPurchaseRow {
  isNewRow: boolean; // true if the user added this row, false if it already existed
  id: string;
  bookId: number;
  bookISBN: string;
  bookTitle: string;
  quantity: number;
  price: number;
  errors?: { [key: string]: string }; // Only present on CSV import
}

// Used for setting initial state
const emptyPurchase: POPurchaseRow = {
  isNewRow: true,
  id: uuid(),
  bookId: 0,
  bookISBN: "",
  bookTitle: "",
  quantity: 1,
  price: 0,
};

export default function PODetail() {
  // -------- STATE --------

  // From URL
  const { id } = useParams();
  const isPOAddPage = id === undefined;
  const [isModifiable, setIsModifiable] = useState<boolean>(id === undefined);

  // For Dropdown Menus
  const [bookMap, setBooksMap] = useState<Map<string, Book>>(new Map());
  const [vendorMap, setVendorMap] = useState<Map<string, number>>(new Map());
  const [booksDropdownTitles, setBooksDropdownTitles] = useState<string[]>([]);

  // The rest of the data
  const [date, setDate] = useState<Date>(new Date());
  const [selectedVendorName, setSelectedVendorName] = useState<string>("");
  // useImmer is used to set state for nested data in a simplified format
  const [purchases, setPurchases] = useImmer<POPurchaseRow[]>([]);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] =
    useState<boolean>(false);
  const [hasUploadedCSV, setHasUploadedCSV] = useState<boolean>(false);
  const [deletePopupVisible, setDeletePopupVisible] = useState<boolean>(false); // Whether the delete popup is shown
  const [isGoBackActive, setIsGoBackActive] = useState<boolean>(false);

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
        })
        .catch(() => console.log(id));
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
      customBody: (rowData: POPurchaseRow) => errorCellBody(rowData.errors),
    },
    {
      field: "bookTitle",
      header: "Book",
      customBody: (rowData: POPurchaseRow) =>
        booksDropDownEditor(
          rowData.bookTitle,
          (newValue) => {
            setPurchases((draft) => {
              const purchase = findById(draft, rowData.id);
              purchase!.bookTitle = newValue;
            });
          },
          !isModifiable
        ),
    },
    {
      field: "quantity",
      header: "Quantity",
      customBody: (rowData: POPurchaseRow) =>
        numberEditor(
          rowData.quantity,
          (newValue) => {
            setPurchases((draft) => {
              const purchase = findById(draft, rowData.id);
              purchase!.quantity = newValue;
              setTotalCost(calculateTotal(draft));
            });
          },
          !isModifiable
        ),
    },
    {
      field: "unitWholesalePrice",
      header: "Unit Wholesale Price ($)",
      customBody: (rowData: POPurchaseRow) =>
        priceEditor(
          rowData.price,
          (newValue) => {
            setPurchases((draft) => {
              const purchase = findById(draft, rowData.id);
              purchase!.price = newValue;
              setTotalCost(calculateTotal(draft));
            });
          },
          !isModifiable
        ),
    },
    {
      field: "subtotal",
      header: "Subtotal ($)",
      customBody: (rowData: POPurchaseRow) =>
        priceBodyTemplate(rowData.price * rowData.quantity),
    },
  ];

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
        showWarningsMapper(toast, nonBlockingErrors, CSVImport200Errors);
      })
      .catch((error) => {
        showFailuresMapper(toast, error.data.errors, CSVImport400Errors);
      });
  };

  // The navigator to switch pages
  const navigate = useNavigate();

  const onRowClick = (event: DataTableRowClickEvent) => {
    // I couldn't figure out a better way to do this...
    // It takes the current index as the table knows it and calculates the actual index in the books array
    const index = event.index;
    const purchase = purchases[index];
    logger.debug("Purchase Order Row Clicked", purchase);
    toBookDetailsPage(purchase);
  };

  // Callback functions for edit/delete buttons
  const toBookDetailsPage = (purcahse: POPurchaseRow) => {
    logger.debug("Edit Book Clicked", purcahse);
    navigate(`/books/detail/${purcahse.bookId}`);
  };

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
      showFailure(toast, "Date is a required field");
      return false;
    }

    return true;
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
        book: Number(bookMap.get(purchase.bookTitle)?.id),
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
        isGoBackActive
          ? navigate("/purchase-orders")
          : window.location.reload();
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
        book: bookMap.get(purchase.bookTitle)?.id ?? purchase.bookId,
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
      })
      .catch(() => showFailure(toast, "Could not modify purchase order"));
  }

  // -------- TEMPLATES/VISUAL ELEMENTS --------

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  // Top Line

  const titleText = (
    <div className="pt-2 col-10">
      <AddDetailModifyTitle
        isModifyPage={isModifiable}
        isAddPage={isPOAddPage}
        detailTitle={"Purchase Order Details"}
        addTitle={"Add Purchase Order"}
        modifyTitle={"Modify Purchase Order"}
      />{" "}
    </div>
  );

  const backButton = (
    <div className="flex col-1">
      <BackButton
        onClick={() => navigate("/purchase-orders")}
        className="ml-1"
      />
    </div>
  );

  const deleteButton = (
    <div className="flex col-1">
      <DeleteButton
        isEnabled={!isPOAddPage}
        onClick={deletePurchaseOrderPopup}
      />
    </div>
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
      emptyItem={emptyPurchase}
      rows={purchases}
      setRows={setPurchases}
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
      isAddPage={isPOAddPage}
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
      isButtonVisible={isModifiable && isPOAddPage}
      isPopupVisible={isConfirmationPopupVisible && isModifiable && isPOAddPage}
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

  // Datatable Items

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
  const deleteColumn = DeleteColumn<POPurchaseRow>({
    onDelete: (rowData) => {
      const newPurchases = filterById(purchases, rowData.id, setPurchases);
      setTotalCost(calculateTotal(newPurchases));
    },
    hidden: !isModifiable,
  });

  const columns = createColumns(COLUMNS);

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
              value={purchases}
              className="editable-cells-table"
              responsiveLayout="scroll"
              editMode="cell"
              rowHover={!isPOAddPage}
              selectionMode={"single"}
              onRowClick={(event) => {
                if (!isPOAddPage && !isModifiable) {
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
