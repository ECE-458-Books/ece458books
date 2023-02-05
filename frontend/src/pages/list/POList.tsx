import { Column } from "primereact/column";
import {
  DataTable,
  DataTableFilterEvent,
  DataTableFilterMetaData,
  DataTablePageEvent,
  DataTableSortEvent,
} from "primereact/datatable";
import { useEffect, useState } from "react";
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
  vendorName: string;
  uniqueBooks: number;
  totalBooks: number;
  totalCost: number;
  purchases: POPurchaseRow[];
}

const COLUMNS: TableColumn[] = [
  { field: "date", header: "Date", filterPlaceholder: "Search by Date" },
  {
    field: "vendorName",
    header: "Vendor Name",
    filterPlaceholder: "Search by Name",
  },
  {
    field: "uniqueBooks",
    header: "Unique Books",
    filterPlaceholder: "Search by Unique Books",
  },
  {
    field: "totalBooks",
    header: "Total Books",
    filterPlaceholder: "Search by Total Books",
  },
  {
    field: "totalCost",
    header: "TotalCost",
    filterPlaceholder: "Search by Total Cost",
  },
];

// Define the column filters
interface Filters {
  [id: string]: DataTableFilterMetaData;
  date: DataTableFilterMetaData;
  vendorName: DataTableFilterMetaData;
  uniqueBooks: DataTableFilterMetaData;
  totalBooks: DataTableFilterMetaData;
  totalCost: DataTableFilterMetaData;
}

// Empty purchase order, used to initialize state
const emptyPurchaseOrder = {
  id: 0,
  date: "",
  vendorName: "",
  uniqueBooks: 0,
  totalBooks: 0,
  totalCost: 0,
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
      vendorName: { value: "", matchMode: "contains" },
      uniqueBooks: { value: "", matchMode: "contains" },
      totalBooks: { value: "", matchMode: "contains" },
      totalCost: { value: "", matchMode: "contains" },
    } as Filters,
  });

  // ----------------- METHODS -----------------

  // The navigator to switch pages
  const navigate = useNavigate();

  // Callback functions for edit/delete buttons
  const editPurchaseOrder = (po: PurchaseOrder) => {
    logger.debug("Edit Purchase Order Clicked", po);
    const detailState: PODetailState = {
      date: po.date,
      data: po.purchases,
      vendor: po.vendorName,
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
  useEffect(() => callAPI(), [pageParams, sortParams, filterParams]);

  // Calls the Vendors API
  const callAPI = () => {
    /*PURCHASES_API.getPurchaseOrders({
      page: pageParams.page ?? 0,
      page_size: pageParams.rows,
      ordering_field: sortParams.sortField,
      ordering_ascending: sortParams.sortOrder,
      search: filterParams.filters.name.value,
    }).then((response) => onAPIResponse(response));*/
  };

  // Set state when response to API call is received
  const onAPIResponse = (response: GetPurchaseOrdersResp) => {
    setPurchaseOrders(response.purchaseOrders);
    setNumberOfPurchaseOrders(response.numberOfPurchaseOrders);
    setLoading(false);
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
    <>
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
    </>
  );
}
