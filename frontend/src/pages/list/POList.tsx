import { Column } from "primereact/column";
import {
  DataTable,
  DataTableFilterEvent,
  DataTableFilterMetaData,
  DataTablePageEvent,
  DataTableSortEvent,
} from "primereact/datatable";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GetPurchaseOrdersResp, PURCHASES_API } from "../../apis/PurchasesAPI";
import DeletePopup from "../../components/DeletePopup";
import { TableColumn } from "../../components/Table";
import EditDeleteTemplate from "../../util/EditDeleteTemplate";
import { logger } from "../../util/Logger";
import { PODetailState, POPurchaseRow } from "../detail/PODetail";
import { NUM_ROWS } from "./BookList";

export interface PurchaseOrder {
  id: number;
  date: string;
  vendor_name: string;
  vendor_id: number;
  num_unique_books: number;
  num_books: number;
  total_cost: number;
  purchases: POPurchaseRow[];
}

const COLUMNS: TableColumn[] = [
  {
    field: "id",
    header: "ID",
    filterPlaceholder: "Search by ID",
    hidden: true,
    filterable: false,
  },
  {
    field: "date",
    header: "Date (YYYY-MM-DD)",
    filterPlaceholder: "Search by Date",
    filterable: false,
  },
  {
    field: "vendor_name",
    header: "Vendor Name",
    filterPlaceholder: "Search by Name",
    filterable: false,
  },
  {
    field: "vendor_id",
    header: "Vendor ID",
    filterPlaceholder: "Search by Name",
    hidden: true,
    filterable: false,
  },
  {
    field: "num_unique_books",
    header: "Unique Books",
    filterPlaceholder: "Search by Unique Books",
    filterable: false,
  },
  {
    field: "num_books",
    header: "Total Books",
    filterPlaceholder: "Search by Total Books",
    filterable: false,
  },
  {
    field: "total_cost",
    header: "Total Cost ($)",
    filterPlaceholder: "Search by Total Cost",
    filterable: false,
  },
];

// Define the column filters
interface Filters {
  [id: string]: DataTableFilterMetaData;
  date: DataTableFilterMetaData;
  vendor_name: DataTableFilterMetaData;
  num_unique_books: DataTableFilterMetaData;
  num_books: DataTableFilterMetaData;
  total_cost: DataTableFilterMetaData;
}

// Empty purchase order, used to initialize state
const emptyPurchaseOrder = {
  id: 0,
  date: "",
  vendor_name: "",
  vendor_id: 0,
  num_unique_books: 0,
  num_books: 0,
  total_cost: 0,
  purchases: [],
};

export default function PurchaseOrderList() {
  // ----------------- STATE -----------------
  const [loading, setLoading] = useState(false); // Whether we show that the table is loading or not
  const [numberOfPurchaseOrders, setNumberOfPurchaseOrders] = useState(0); // The number of elements that match the query
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]); // The data displayed in the table
  const [deletePopupVisible, setDeletePopupVisible] = useState(false); // Whether the delete popup is shown
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

  // The current state of the filters
  const [filterParams, setFilterParams] = useState<any>({
    filters: {
      id: { value: "", matchMode: "contains" },
      date: { value: "", matchMode: "contains" },
      vendor_name: { value: "", matchMode: "contains" },
      num_unique_books: { value: "", matchMode: "contains" },
      num_books: { value: "", matchMode: "contains" },
      total_cost: { value: "", matchMode: "contains" },
    } as Filters,
  });

  // ----------------- METHODS -----------------

  // The navigator to switch pages
  const navigate = useNavigate();

  // Callback functions for edit/delete buttons
  const editPurchaseOrder = (po: PurchaseOrder) => {
    logger.debug("Edit Purchase Order Clicked", po);
    const detailState: PODetailState = {
      date: new Date(po.date.replace("-", "/")),
      purchases: po.purchases,
      id: po.id,
      vendorName: po.vendor_name,
      vendorID: po.vendor_id,
      isAddPage: false,
      isModifiable: false,
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
    PURCHASES_API.deletePurchaseOrder(
      selectedDeletePurchaseOrder.id.toString()
    ).then((response) => {
      if (response.status == 204) {
        showSuccess();
      } else {
        showFailure();
        return;
      }
    });
    const _purchaseOrders = purchaseOrders.filter(
      (selectPO) => selectedDeletePurchaseOrder.id != selectPO.id
    );
    setPurchaseOrders(_purchaseOrders);
    setSelectedDeletePurchaseOrder(emptyPurchaseOrder);
  };

  // Called when any of the filters (search boxes) are typed into
  const onFilter = (event: DataTableFilterEvent) => {
    logger.debug("Filter Applied", event);
    setLoading(true);
    setFilterParams(event);
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

  // When any of the list of params are changed, useEffect is called to hit the API endpoint
  useEffect(() => callAPI(), [sortParams, pageParams, filterParams]);

  // Calls the Vendors API
  const callAPI = () => {
    // Invert sort order
    let sortField = sortParams.sortField;
    if (sortParams.sortOrder == -1) {
      sortField = "-".concat(sortField);
    }

    PURCHASES_API.getPurchaseOrders({
      page: pageParams.page ?? 0,
      page_size: pageParams.rows,
      ordering: sortField,
    }).then((response) => {
      return onAPIResponse(response);
    });
  };

  // Set state when response to API call is received
  const onAPIResponse = (response: GetPurchaseOrdersResp) => {
    setPurchaseOrders(response.purchaseOrders);
    setNumberOfPurchaseOrders(response.numberOfPurchaseOrders);
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
    onEdit: (rowData) => editPurchaseOrder(rowData),
    onDelete: (rowData) => deletePurchaseOrderPopup(rowData),
  });

  // The delete popup
  const deletePopup = (
    <DeletePopup
      deleteItemIdentifier={selectedDeletePurchaseOrder.id.toString()}
      onConfirm={() => deletePurchaseOrderFinal()}
      setIsVisible={setDeletePopupVisible}
    />
  );

  // Map column objects to actual columns
  const dynamicColumns = COLUMNS.map((col) => {
    return (
      <Column
        // Indexing/header
        key={col.field}
        field={col.field}
        header={col.header}
        // Filtering
        filter
        filterElement={col.customFilter}
        //filterMatchMode={"contains"}
        filterPlaceholder={col.filterPlaceholder}
        // Sorting
        sortable
        //sortField={col.field}
        // Hiding Fields
        showFilterMenuOptions={false}
        showClearButton={false}
        // Other
        style={{ minWidth: "16rem" }}
        hidden={col.hidden}
      />
    );
  });

  return (
    <div className="card pt-5 px-2">
      <Toast ref={toast} />
      <DataTable
        // General Settings
        value={purchaseOrders}
        lazy
        responsiveLayout="scroll"
        filterDisplay="row"
        loading={loading}
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
        // Filtering
        onFilter={onFilter}
        filters={filterParams.filters}
      >
        {dynamicColumns}
        <Column body={editDeleteCellTemplate} style={{ minWidth: "16rem" }} />
      </DataTable>
      {deletePopupVisible && deletePopup}
    </div>
  );
}
