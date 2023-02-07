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
import { GetSalesReconciliationsResp, SALES_API } from "../../apis/SalesAPI";
import DeletePopup from "../../components/DeletePopup";
import { TableColumn } from "../../components/Table";
import EditDeleteTemplate from "../../util/EditDeleteTemplate";
import { logger } from "../../util/Logger";
import { SRDetailState, SRSaleRow } from "../detail/SRDetail";
import { NUM_ROWS } from "./BookList";

export interface SalesReconciliation {
  id: number;
  date: string;
  sales: SRSaleRow[];
  uniqueBooks: number;
  totalBooks: number;
  totalRevenue: number;
}

const COLUMNS: TableColumn[] = [
  { field: "date", header: "Date", filterPlaceholder: "Search by Total Date" },
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
    field: "totalRevenue",
    header: "Total Revenue",
    filterPlaceholder: "Search by Total Revenue",
  },
];

// Define the column filters
interface Filters {
  [id: string]: DataTableFilterMetaData;
  date: DataTableFilterMetaData;
  uniqueBooks: DataTableFilterMetaData;
  totalBooks: DataTableFilterMetaData;
  totalRevenue: DataTableFilterMetaData;
}

// Empty sales reconciliation, used to initialize state
const emptySalesReconciliation = {
  id: 0,
  date: "",
  vendorName: "",
  sales: [],
  uniqueBooks: 0,
  totalBooks: 0,
  totalRevenue: 0,
};

export default function SalesReconciliationList() {
  // ----------------- STATE -----------------
  const [loading, setLoading] = useState(false); // Whether we show that the table is loading or not
  const [numberOfSalesReconciliations, setNumberOfSalesReconciliations] =
    useState(0); // The number of elements that match the query
  const [salesReconciliations, setSalesReconciliations] = useState<
    SalesReconciliation[]
  >([]); // The data displayed in the table
  const [deletePopupVisible, setDeletePopupVisible] = useState(false); // Whether the delete popup is shown
  const [
    selectedDeleteSalesReconciliation,
    setSelectedDeleteSalesReconciliation,
  ] = useState<SalesReconciliation>(emptySalesReconciliation); // The element that has been clicked on to delete

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
      uniqueBooks: { value: "", matchMode: "contains" },
      totalBooks: { value: "", matchMode: "contains" },
      totalRevenue: { value: "", matchMode: "contains" },
    } as Filters,
  });

  // ----------------- METHODS -----------------

  // The navigator to switch pages
  const navigate = useNavigate();

  // Callback functions for edit/delete buttons
  const editSalesReconciliation = (sr: SalesReconciliation) => {
    logger.debug("Edit Sales Reconciliation Clicked", sr);
    const detailState: SRDetailState = {
      date: sr.date,
      data: sr.sales,
      isAddPage: false,
      isModifiable: false,
      isConfirmationPopupVisible: false,
    };

    navigate("/sales-reconciliations/detail", { state: detailState });
  };

  // Called to make delete pop up show
  const deleteSalesReconciliationPopup = (sr: SalesReconciliation) => {
    logger.debug("Delete Sales Reconciliation Clicked", sr);
    setSelectedDeleteSalesReconciliation(sr);
    setDeletePopupVisible(true);
  };

  // Call to actually delete the element
  const deleteSalesReconciliationFinal = () => {
    logger.debug(
      "Delete Sales Reconciliation Finalized",
      selectedDeleteSalesReconciliation
    );
    setDeletePopupVisible(false);
    setSelectedDeleteSalesReconciliation(emptySalesReconciliation);
  };

  // Called when any of the filters (search boxes) are typed into
  const onFilter = (event: DataTableFilterEvent) => {
    logger.debug("Filter Applied", event);
    setLoading(true);
    setFilterParams(event);
  };

  // Called when any of the columns are selected to be sorted
  const onSort = (event: DataTableSortEvent) => {
    logger.debug("Sort Applied", event);
    setLoading(true);
    setSortParams(event);
  };

  // Called when the paginator page is switched
  const onPage = (event: DataTablePageEvent) => {
    logger.debug("Page Applied", event);
    setLoading(true);
    setPageParams(event);
  };

  // When any of the list of params are changed, useEffect is called to hit the API endpoint
  useEffect(() => callAPI(), [sortParams, pageParams, filterParams]);

  // Calls the Vendors API
  // const callAPI = () => {
  //   SALES_API.getSalesReconciliations({
  //     page: pageParams.page ?? 0,
  //     page_size: pageParams.rows,
  //     ordering_field: sortParams.sortField,
  //     ordering_ascending: sortParams.sortOrder,
  //     search: filterParams.filters.name.value,
  //   }).then((response) => onAPIResponse(response));
  // };

  const callAPI = () => {
    SALES_API.getSalesReconciliations().then((response) =>
      onAPIResponse(response)
    );
  };

  // Set state when response to API call is received
  const onAPIResponse = (response: GetSalesReconciliationsResp) => {
    setSalesReconciliations(response.salesReconciliations);
    setNumberOfSalesReconciliations(response.numberOfSalesReconciliations);
    setLoading(false);
  };

  // ----------------- TEMPLATES/VISIBLE COMPONENTS -----------------

  // Edit/Delete Cell Template
  const editDeleteCellTemplate = EditDeleteTemplate<SalesReconciliation>({
    onEdit: (rowData) => editSalesReconciliation(rowData),
    onDelete: (rowData) => deleteSalesReconciliationPopup(rowData),
  });

  // The delete popup
  const deletePopup = (
    <DeletePopup
      deleteItemIdentifier={selectedDeleteSalesReconciliation.id.toString()}
      onConfirm={() => deleteSalesReconciliationFinal()}
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
        value={salesReconciliations}
        lazy
        responsiveLayout="scroll"
        filterDisplay="row"
        loading={loading}
        // Paginator
        paginator
        first={pageParams.first}
        rows={NUM_ROWS}
        totalRecords={numberOfSalesReconciliations}
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
