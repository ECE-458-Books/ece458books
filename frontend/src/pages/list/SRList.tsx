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
  APISRSortFieldMap,
  APIToInternalSRConversion,
} from "../../apis/Conversions";
import { GetSRsResp, SALES_API } from "../../apis/SalesAPI";
import DeletePopup from "../../components/popups/DeletePopup";
import { createColumns, TableColumn } from "../../components/TableColumns";
import EditDeleteTemplate from "../../util/EditDeleteTemplate";
import { logger } from "../../util/Logger";
import {
  dateBodyTemplate,
  priceBodyTemplate,
} from "../../util/TableCellEditFuncs";
import { SRSaleRow } from "../detail/SRDetail";
import { NUM_ROWS } from "./BookList";

export interface SalesReconciliation {
  id: string;
  date: Date;
  sales: SRSaleRow[];
  uniqueBooks: number;
  totalBooks: number;
  totalRevenue: number;
}

const COLUMNS: TableColumn[] = [
  {
    field: "date",
    header: "Date (YYYY-MM-DD)",
    sortable: true,
    customBody: (rowData: SalesReconciliation) =>
      dateBodyTemplate(rowData.date),
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
    field: "totalRevenue",
    header: "Total Revenue ($)",
    sortable: true,
    customBody: (rowData: SalesReconciliation) =>
      priceBodyTemplate(rowData.totalRevenue),
  },
];

// Empty sales reconciliation, used to initialize state
const emptySalesReconciliation: SalesReconciliation = {
  id: "0",
  date: new Date(),
  sales: [],
  uniqueBooks: 0,
  totalBooks: 0,
  totalRevenue: 0,
};

export default function SalesReconciliationList() {
  // ----------------- STATE -----------------
  const [loading, setLoading] = useState<boolean>(false); // Whether we show that the table is loading or not
  const [numberOfSalesReconciliations, setNumberOfSalesReconciliations] =
    useState(0); // The number of elements that match the query
  const [salesReconciliations, setSalesReconciliations] = useState<
    SalesReconciliation[]
  >([]); // The data displayed in the table
  const [deletePopupVisible, setDeletePopupVisible] = useState<boolean>(false); // Whether the delete popup is shown
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

  // ----------------- METHODS -----------------

  // The navigator to switch pages
  const navigate = useNavigate();

  // Callback functions for edit/delete buttons
  const toDetailPage = (sr: SalesReconciliation) => {
    logger.debug("Edit Sales Reconciliation Clicked", sr);
    navigate(`/sales-reconciliations/detail/${sr.id}`);
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
    SALES_API.deleteSalesReconciliation({
      id: selectedDeleteSalesReconciliation.id,
    })
      .then(() => showSuccess())
      .catch(() => showFailure());
    const _salesReconciliations = salesReconciliations.filter(
      (selectSR) => selectedDeleteSalesReconciliation.id != selectSR.id
    );
    setSalesReconciliations(_salesReconciliations);

    setSelectedDeleteSalesReconciliation(emptySalesReconciliation);
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

  const onRowClick = (event: DataTableRowClickEvent) => {
    // I couldn't figure out a better way to do this...
    // It takes the current index as the table knows it and calculates the actual index in the genres array
    const index = event.index - NUM_ROWS * (pageParams.page ?? 0);
    const salesReconciliation = salesReconciliations[index];
    logger.debug("Sales Reconciliation Row Clicked", salesReconciliation);
    toDetailPage(salesReconciliation);
  };

  // When any of the list of params are changed, useEffect is called to hit the API endpoint
  useEffect(() => callAPI(), [sortParams, pageParams]);

  const callAPI = () => {
    // Invert sort order
    let sortField = APISRSortFieldMap.get(sortParams.sortField) ?? "";
    if (sortParams.sortOrder == -1) {
      sortField = "-".concat(sortField);
    }

    SALES_API.getSalesReconciliations({
      page: (pageParams.page ?? 0) + 1,
      page_size: pageParams.rows,
      ordering: sortField,
    }).then((response) => onAPIResponse(response));
  };

  // Set state when response to API call is received
  const onAPIResponse = (response: GetSRsResp) => {
    setSalesReconciliations(
      response.results.map((sr) => APIToInternalSRConversion(sr))
    );
    setNumberOfSalesReconciliations(response.count);
    setLoading(false);
  };

  // ----------------- TEMPLATES/VISIBLE COMPONENTS -----------------

  // Edit/Delete Cell Template
  const editDeleteCellTemplate = EditDeleteTemplate<SalesReconciliation>({
    onEdit: (rowData) => toDetailPage(rowData),
    onDelete: (rowData) => deleteSalesReconciliationPopup(rowData),
    deleteDisabled: () => false,
  });

  // The delete popup
  const deletePopup = (
    <DeletePopup
      deleteItemIdentifier={" this sales reconciliation"}
      onConfirm={() => deleteSalesReconciliationFinal()}
      setIsVisible={setDeletePopupVisible}
    />
  );

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  const showSuccess = () => {
    toast.current?.show({
      severity: "success",
      summary: "Sales reconciliation deleted",
    });
  };

  const showFailure = () => {
    toast.current?.show({
      severity: "error",
      summary: "Sales reconciliation not deleted",
    });
  };

  const columns = createColumns(COLUMNS);

  return (
    <div className="card pt-5 px-2">
      <Toast ref={toast} />
      <DataTable
        // General Settings
        showGridlines
        value={salesReconciliations}
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
        totalRecords={numberOfSalesReconciliations}
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
