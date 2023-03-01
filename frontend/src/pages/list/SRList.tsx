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
import { APISR, GetSRsResp, SALES_API } from "../../apis/SalesAPI";
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
import AddPageButton from "../../components/buttons/AddPageButton";
import LabeledSwitch from "../../components/buttons/LabeledSwitch";
import SelectSizeButton from "../../components/buttons/SelectSizeButton";

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
    style: { minWidth: "8rem", width: "10rem" },
  },
  {
    field: "uniqueBooks",
    header: "Unique Books",
    sortable: true,
    style: { minWidth: "8rem", width: "10rem" },
  },
  {
    field: "totalBooks",
    header: "Total Books",
    sortable: true,
    style: { minWidth: "8rem", width: "10rem" },
  },
  {
    field: "totalRevenue",
    header: "Total Revenue ($)",
    sortable: true,
    customBody: (rowData: SalesReconciliation) =>
      priceBodyTemplate(rowData.totalRevenue),
    style: { minWidth: "8rem", width: "12rem" },
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

  const [rows, setRows] = useState<number>(NUM_ROWS);
  const [isNoPagination, setIsNoPagination] = useState<boolean>(false);
  const [size, setSize] = useState<string>("small");

  // The current state of sorting.
  const [sortParams, setSortParams] = useState<DataTableSortEvent>({
    sortField: "",
    sortOrder: null,
    multiSortMeta: null, // Not used
  });

  // The current state of the paginator
  const [pageParams, setPageParams] = useState<DataTablePageEvent>({
    first: 0,
    rows: rows,
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
    setRows(event.rows);
    setLoading(true);
    setPageParams(event);
  };

  const onRowClick = (event: DataTableRowClickEvent) => {
    const salesReconciliation = event.data as SalesReconciliation;
    logger.debug("Sales Reconciliation Row Clicked", salesReconciliation);
    toDetailPage(salesReconciliation);
  };

  // When any of the list of params are changed, useEffect is called to hit the API endpoint
  useEffect(() => callAPI(), [sortParams, pageParams, isNoPagination]);

  const callAPI = () => {
    // Invert sort order
    let sortField = APISRSortFieldMap.get(sortParams.sortField) ?? "";
    if (sortParams.sortOrder == -1) {
      sortField = "-".concat(sortField);
    }

    if (!isNoPagination) {
      SALES_API.getSalesReconciliations({
        page: (pageParams.page ?? 0) + 1,
        page_size: pageParams.rows,
        ordering: sortField,
      }).then((response) => onAPIResponse(response));
    } else {
      SALES_API.getSalesReconciliationsNoPagination().then((response) =>
        onAPIResponseNoPagination(response)
      );
    }
  };

  // Set state when response to API call is received
  const onAPIResponseNoPagination = (response: APISR[]) => {
    setSalesReconciliations(
      response.map((sr) => APIToInternalSRConversion(sr))
    );
    setNumberOfSalesReconciliations(response.length);
    setLoading(false);
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

  const addSRButton = (
    <div className="flex justify-content-end col-3">
      <AddPageButton
        onClick={() => navigate("/sales-reconciliations/add")}
        label="Add Sale"
        className="mr-2"
      />
    </div>
  );

  const noPaginationSwitch = (
    <div className="flex col-3 justify-content-center p-0 my-auto">
      <LabeledSwitch
        label="Show All"
        onChange={() => setIsNoPagination(!isNoPagination)}
        value={isNoPagination}
      />
    </div>
  );

  const selectSizeButton = (
    <div className="flex col-6 justify-content-center my-1 p-0">
      <SelectSizeButton value={size} onChange={(e) => setSize(e.value)} />
    </div>
  );

  return (
    <div>
      <div className="grid flex m-1">
        {noPaginationSwitch}
        {selectSizeButton}
        {addSRButton}
      </div>
      <div className="flex justify-content-center">
        <div className="card col-11 pt-0 px-3 justify-content-center">
          <Toast ref={toast} />
          <DataTable
            // General Settings
            showGridlines
            value={salesReconciliations}
            lazy
            responsiveLayout="scroll"
            loading={loading}
            size={size ?? "small"}
            // Row clicking
            rowHover
            selectionMode={"single"}
            onRowClick={(event) => onRowClick(event)}
            // Paginator
            paginator={!isNoPagination}
            first={pageParams.first}
            rows={rows}
            totalRecords={numberOfSalesReconciliations}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            onPage={onPage}
            rowsPerPageOptions={[5, 10, 15, 25, 50]}
            paginatorPosition="both"
            // Sorting
            onSort={onSort}
            sortField={sortParams.sortField}
            sortOrder={sortParams.sortOrder}
          >
            {columns}
            <Column
              body={editDeleteCellTemplate}
              hidden
              style={{ minWidth: "4rem" }}
            />
          </DataTable>
          {deletePopupVisible && deletePopup}
        </div>
      </div>
    </div>
  );
}
