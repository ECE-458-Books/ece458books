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
} from "../../apis/purchases/PurchasesConversions";
import {
  APIPO,
  GetPOsResp,
  PURCHASES_API,
} from "../../apis/purchases/PurchasesAPI";
import {
  createColumns,
  TableColumn,
} from "../../components/datatable/TableColumns";
import { logger } from "../../util/Logger";
import { DateTemplate } from "../../components/templates/DateTemplate";
import PriceTemplate from "../../components/templates/PriceTemplate";
import { POPurchaseRow } from "./PODetail";
import { NUM_ROWS } from "../books/BookList";
import AddPageButton from "../../components/buttons/AddPageButton";
import LabeledSwitch from "../../components/buttons/LabeledSwitch";
import SelectSizeButton, {
  SelectSizeButtonOptions,
} from "../../components/buttons/SelectSizeButton";
import { isHighlightingText } from "../../util/ClickCheck";

export interface PurchaseOrder {
  id: string;
  date: Date;
  vendorName: string;
  vendorId: number;
  uniqueBooks: number;
  totalBooks: number;
  totalCost: number;
  isDeletable: boolean;
  purchases: POPurchaseRow[];
}

const COLUMNS: TableColumn<PurchaseOrder>[] = [
  {
    field: "date",
    header: "Date (YYYY-MM-DD)",
    sortable: true,
    customBody: (rowData: PurchaseOrder) => DateTemplate(rowData.date),
    style: { minWidth: "8rem", width: "10rem" },
  },
  {
    field: "vendorName",
    header: "Vendor Name",
    sortable: true,
    style: { minWidth: "8rem", width: "16rem" },
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
    field: "totalCost",
    header: "Total Cost ($)",
    sortable: true,
    customBody: (rowData: PurchaseOrder) => PriceTemplate(rowData.totalCost),
    style: { minWidth: "8rem", width: "12rem" },
  },
];

export default function PurchaseOrderList() {
  // ----------------- STATE -----------------
  const [loading, setLoading] = useState<boolean>(false); // Whether we show that the table is loading or not
  const [numberOfPurchaseOrders, setNumberOfPurchaseOrders] =
    useState<number>(0); // The number of elements that match the query
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]); // The data displayed in the table

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
  const toDetailPage = (po: PurchaseOrder) => {
    logger.debug("Edit Purchase Order Clicked", po);
    navigate(`/purchase-orders/detail/${po.id}`);
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
    setRows(event.rows);
    setLoading(true);
    setPageParams(event);
  };

  const onRowClick = (event: DataTableRowClickEvent) => {
    if (isHighlightingText()) return;
    const purchaseOrder = event.data as PurchaseOrder;
    logger.debug("Purchase Order Row Clicked", purchaseOrder);
    toDetailPage(purchaseOrder);
  };

  // When any of the list of params are changed, useEffect is called to hit the API endpoint
  useEffect(() => callAPI(), [sortParams, pageParams, isNoPagination]);

  // Calls the Vendors API
  const callAPI = () => {
    // Invert sort order
    let sortField = APIPOSortFieldMap.get(sortParams.sortField) ?? "";
    if (sortParams.sortOrder == -1) {
      sortField = "-".concat(sortField);
    }

    if (!isNoPagination) {
      PURCHASES_API.getPurchaseOrders({
        page: (pageParams.page ?? 0) + 1,
        page_size: pageParams.rows,
        ordering: sortField,
      }).then((response) => {
        return onAPIResponse(response);
      });
    } else {
      PURCHASES_API.getPurchaseOrdersNoPagination({
        no_pagination: true,
        ordering: sortField,
      }).then((response) => onAPIResponseNoPagination(response));
    }
  };

  // Set state when response to API call is received
  const onAPIResponseNoPagination = (response: APIPO[]) => {
    setPurchaseOrders(response.map((po) => APIToInternalPOConversion(po)));
    setNumberOfPurchaseOrders(response.length);
    setLoading(false);
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

  // ----------------- TEMPLATES/VISIBLE COMPONENTS -----------------

  const columns = createColumns(COLUMNS);

  const addPOButton = (
    <div className="flex justify-content-end col-3">
      <AddPageButton
        onClick={() => navigate("/purchase-orders/add")}
        label="Add Order"
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
        {addPOButton}
      </div>
      <div className="flex justify-content-center">
        <div className="card col-11 pt-0 px-3 justify-content-center">
          <Toast ref={toast} />
          <DataTable
            showGridlines
            // General Settings
            value={purchaseOrders}
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
            totalRecords={numberOfPurchaseOrders}
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
