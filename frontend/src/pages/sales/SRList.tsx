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
} from "../../apis/sales/SalesConversions";
import { APISR, GetSRsResp, SALES_API } from "../../apis/sales/SalesAPI";
import {
  createColumns,
  TableColumn,
} from "../../components/datatable/TableColumns";
import { logger } from "../../util/Logger";
import { DateBodyTemplate } from "../../components/templates/DateBodyTemplate";
import PriceTemplate from "../../components/templates/PriceTemplate";
import { SRSaleRow } from "./SRDetail";
import { NUM_ROWS } from "../books/BookList";
import AddPageButton from "../../components/buttons/AddPageButton";
import LabeledSwitch from "../../components/buttons/LabeledSwitch";
import SelectSizeButton, {
  SelectSizeButtonOptions,
} from "../../components/buttons/SelectSizeButton";
import { isHighlightingText } from "../../util/ClickCheck";

export interface SalesReconciliation {
  id: string;
  date: Date;
  sales: SRSaleRow[];
  uniqueBooks: number;
  totalBooks: number;
  totalRevenue: number;
  isDeletable: boolean;
}

const COLUMNS: TableColumn[] = [
  {
    field: "date",
    header: "Date (YYYY-MM-DD)",
    sortable: true,
    customBody: (rowData: SalesReconciliation) =>
      DateBodyTemplate(rowData.date),
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
      PriceTemplate(rowData.totalRevenue),
    style: { minWidth: "8rem", width: "12rem" },
  },
];

export default function SalesReconciliationList() {
  // ----------------- STATE -----------------
  const [loading, setLoading] = useState<boolean>(false); // Whether we show that the table is loading or not
  const [numberOfSalesReconciliations, setNumberOfSalesReconciliations] =
    useState(0); // The number of elements that match the query
  const [salesReconciliations, setSalesReconciliations] = useState<
    SalesReconciliation[]
  >([]); // The data displayed in the table

  const [rows, setRows] = useState<number>(NUM_ROWS);
  const [isNoPagination, setIsNoPagination] = useState<boolean>(false);
  const [size, setSize] = useState<SelectSizeButtonOptions>(
    SelectSizeButtonOptions.Small
  );

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
    if (isHighlightingText()) return;
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
      SALES_API.getSalesReconciliationsNoPagination({
        no_pagination: true,
        ordering: sortField,
      }).then((response) => onAPIResponseNoPagination(response));
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

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

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
            size={size}
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
          </DataTable>
        </div>
      </div>
    </div>
  );
}
