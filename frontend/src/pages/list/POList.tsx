import { Column } from "primereact/column";
import {
  DataTable,
  DataTablePageEvent,
  DataTableRowClickEvent,
  DataTableSortEvent,
} from "primereact/datatable";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  APIPOSortFieldMap,
  APIToInternalPOConversion,
} from "../../apis/Conversions";
import { GetPOsResp, PURCHASES_API } from "../../apis/PurchasesAPI";
import DeletePopup from "../../components/DeletePopup";
import { createColumns, TableColumn } from "../../components/TableColumns";
import EditDeleteTemplate from "../../util/EditDeleteTemplate";
import { logger } from "../../util/Logger";
import { priceBodyTemplate } from "../../util/TableCellEditFuncs";
import { PODetailState, POPurchaseRow } from "../detail/PODetail";
import { NUM_ROWS } from "./BookList";

export interface PurchaseOrder {
  id: number;
  date: string;
  vendorName: string;
  vendorId: number;
  uniqueBooks: number;
  totalBooks: number;
  totalCost: number;
  purchases: POPurchaseRow[];
}

const COLUMNS: TableColumn[] = [
  {
    field: "date",
    header: "Date (YYYY-MM-DD)",
    sortable: true,
  },
  {
    field: "vendorName",
    header: "Vendor Name",
    sortable: true,
  },
  {
    field: "uniqueBooks",
    header: "Unique Books",
    sortable: true,
  },
  {
    field: "totalBooks",
    header: "Total Books",
    sortable: true,
  },
  {
    field: "totalCost",
    header: "Total Cost ($)",
    sortable: true,
    customBody: (rowData: PurchaseOrder) =>
      priceBodyTemplate(rowData.totalCost),
  },
];

// Empty purchase order, used to initialize state
const emptyPurchaseOrder: PurchaseOrder = {
  id: 0,
  date: "",
  vendorName: "",
  vendorId: 0,
  uniqueBooks: 0,
  totalBooks: 0,
  totalCost: 0,
  purchases: [],
};

export default function PurchaseOrderList() {
  // ----------------- STATE -----------------
  const [loading, setLoading] = useState<boolean>(false); // Whether we show that the table is loading or not
  const [numberOfPurchaseOrders, setNumberOfPurchaseOrders] =
    useState<number>(0); // The number of elements that match the query
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]); // The data displayed in the table
  const [deletePopupVisible, setDeletePopupVisible] = useState<boolean>(false); // Whether the delete popup is shown
  const [selectedDeletePurchaseOrder, setSelectedDeletePurchaseOrder] =
    useState<PurchaseOrder>(emptyPurchaseOrder); // The element that has been clicked on to delete

  // The current state of sorting.
  const [sortParams, setSortParams] = useState<DataTableSortEvent>({
    sortField: "",
    sortOrder: null,
    multiSortMeta: null, // Not used
  });

  // The current state of the paginator
  const [pageParams, setPageParams] = useState<DataTablePageEvent>({
    first: 0,
    rows: NUM_ROWS,
    page: 0,
  });

  // ----------------- METHODS -----------------

  // The navigator to switch pages
  const navigate = useNavigate();

  // Callback functions for edit/delete buttons
  const toDetailPage = (po: PurchaseOrder, isModifiable: boolean) => {
    logger.debug("Edit Purchase Order Clicked", po);
    const detailState: PODetailState = {
      date: new Date(po.date.replace("-", "/")),
      purchases: po.purchases,
      totalCost: po.totalCost,
      id: po.id,
      vendorName: po.vendorName,
      vendorID: po.vendorId,
      isAddPage: false,
      isModifiable: isModifiable,
      isConfirmationPopupVisible: false,
    };

    navigate("/purchase-orders/detail", { state: detailState });
  };

  // Called to make delete pop up show
  const deletePurchaseOrderPopup = (po: PurchaseOrder) => {
    logger.debug("Delete Purchase Order Clicked", po);
    setSelectedDeletePurchaseOrder(po);
    setDeletePopupVisible(true);
  };

  // Call to actually delete the element
  const deletePurchaseOrderFinal = () => {
    logger.debug("Edit Purchase Order Finalized", selectedDeletePurchaseOrder);
    setDeletePopupVisible(false);
    PURCHASES_API.deletePurchaseOrder({
      id: selectedDeletePurchaseOrder.id,
    })
      .then(() => showSuccess())
      .catch(() => showFailure());
    const _purchaseOrders = purchaseOrders.filter(
      (selectPO) => selectedDeletePurchaseOrder.id != selectPO.id
    );
    setPurchaseOrders(_purchaseOrders);
    setSelectedDeletePurchaseOrder(emptyPurchaseOrder);
  };

  // Called when any of the columns are selected to be sorted
  const onSort = (event: DataTableSortEvent) => {
    logger.debug("Page Applied", event);
    setLoading(true);
    setSortParams(event);
  };

  // Called when the paginator page is switched
  const onPage = (event: DataTablePageEvent) => {
    logger.debug("Sort Applied", event);
    setLoading(true);
    setPageParams(event);
  };

  const onRowClick = (event: DataTableRowClickEvent) => {
    // I couldn't figure out a better way to do this...
    // It takes the current index as the table knows it and calculates the actual index in the genres array
    const index = event.index - NUM_ROWS * (pageParams.page ?? 0);
    const purchaseOrder = purchaseOrders[index];
    logger.debug("Purchase Order Row Clicked", purchaseOrder);
    toDetailPage(purchaseOrder, false);
  };

  // When any of the list of params are changed, useEffect is called to hit the API endpoint
  useEffect(() => callAPI(), [sortParams, pageParams]);

  // Calls the Vendors API
  const callAPI = () => {
    // Invert sort order
    let sortField = APIPOSortFieldMap.get(sortParams.sortField) ?? "";
    if (sortParams.sortOrder == -1) {
      sortField = "-".concat(sortField);
    }

    PURCHASES_API.getPurchaseOrders({
      page: (pageParams.page ?? 0) + 1,
      page_size: pageParams.rows,
      ordering: sortField,
    }).then((response) => {
      return onAPIResponse(response);
    });
  };

  // Set state when response to API call is received
  const onAPIResponse = (response: GetPOsResp) => {
    setPurchaseOrders(
      response.results.map((po) => APIToInternalPOConversion(po))
    );
    setNumberOfPurchaseOrders(response.count);
    setLoading(false);
  };

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  const showSuccess = () => {
    toast.current?.show({
      severity: "success",
      summary: "Purchase order deleted",
    });
  };

  const showFailure = () => {
    toast.current?.show({
      severity: "error",
      summary:
        "Purchase order could not be deleted, not all book inventory counts are 0",
    });
  };

  // ----------------- TEMPLATES/VISIBLE COMPONENTS -----------------

  // Edit/Delete Cell Template
  const editDeleteCellTemplate = EditDeleteTemplate<PurchaseOrder>({
    onEdit: (rowData) => toDetailPage(rowData, true),
    onDelete: (rowData) => deletePurchaseOrderPopup(rowData),
  });

  // The delete popup
  const deletePopup = (
    <DeletePopup
      deleteItemIdentifier={"this purchase order"}
      onConfirm={() => deletePurchaseOrderFinal()}
      setIsVisible={setDeletePopupVisible}
    />
  );

  const columns = createColumns(COLUMNS);

  return (
    <div className="card pt-5 px-2">
      <Toast ref={toast} />
      <DataTable
        showGridlines
        // General Settings
        value={purchaseOrders}
        lazy
        responsiveLayout="scroll"
        loading={loading}
        // Row clicking
        rowHover
        selectionMode={"single"}
        onRowClick={(event) => onRowClick(event)}
        // Paginator
        paginator
        first={pageParams.first}
        rows={NUM_ROWS}
        totalRecords={numberOfPurchaseOrders}
        paginatorTemplate="PrevPageLink NextPageLink"
        onPage={onPage}
        // Sorting
        onSort={onSort}
        sortField={sortParams.sortField}
        sortOrder={sortParams.sortOrder}
      >
        {columns}
        <Column body={editDeleteCellTemplate} style={{ minWidth: "16rem" }} />
      </DataTable>
      {deletePopupVisible && deletePopup}
    </div>
  );
}
