import { useEffect, useRef, useState } from "react";
import { DateTemplate } from "../../components/templates/DateTemplate";
import PriceTemplate from "../../components/templates/PriceTemplate";
import { BBSaleRow } from "./BBDetail";
import {
  TableColumn,
  createColumns,
} from "../../components/datatable/TableColumns";
import { Toast } from "primereact/toast";
import {
  DataTable,
  DataTablePageEvent,
  DataTableRowClickEvent,
  DataTableSortEvent,
} from "primereact/datatable";
import { APIBB, BUYBACK_API, GetBBsResp } from "../../apis/buybacks/BuyBackAPI";
import {
  APIBBSortFieldMap,
  APIToInternalBBConversion,
} from "../../apis/buybacks/BuybacksConversions";
import { NUM_ROWS } from "../books/BookList";
import { logger } from "../../util/Logger";
import { useNavigate } from "react-router-dom";
import AddPageButton from "../../components/buttons/AddPageButton";
import LabeledSwitch from "../../components/buttons/LabeledSwitch";
import SelectSizeButton, {
  SelectSizeButtonOptions,
} from "../../components/buttons/SelectSizeButton";

export interface BuyBack {
  id: string;
  date: Date;
  vendorID: number;
  vendorName: string;
  sales: BBSaleRow[];
  uniqueBooks: number;
  isDeletable: boolean;
  totalBooks: number;
  totalRevenue: number;
}

const COLUMNS: TableColumn<BuyBack>[] = [
  {
    field: "date",
    header: "Date (YYYY-MM-DD)",
    sortable: true,
    customBody: (rowData: BuyBack) => DateTemplate(rowData.date),
    style: { minWidth: "8rem", width: "10rem" },
  },
  {
    field: "vendorName",
    header: "Vendor",
    sortable: true,
    style: { minWidth: "8rem", width: "16rem" },
  },
  {
    field: "uniqueBooks",
    header: "Unique Books",
    sortable: true,
    style: { minWidth: "8rem", width: "7rem" },
  },
  {
    field: "totalBooks",
    header: "Total Books",
    sortable: true,
    style: { minWidth: "8rem", width: "7rem" },
  },
  {
    field: "totalRevenue",
    header: "Total Revenue ($)",
    sortable: true,
    customBody: (rowData: BuyBack) => PriceTemplate(rowData.totalRevenue),
    style: { minWidth: "8rem", width: "10rem" },
  },
];

export default function BuyBackList() {
  // ----------------- STATE -----------------
  const [loading, setLoading] = useState<boolean>(false); // Whether we show that the table is loading or not
  const [numberOfBuyBacks, setNumberOfBuyBacks] = useState(0); // The number of elements that match the query
  const [buyBacks, setBuyBacks] = useState<BuyBack[]>([]); // The data displayed in the table

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
  const toDetailPage = (bb: BuyBack) => {
    logger.debug("Edit Book Buyback Clicked", bb);
    navigate(`/book-buybacks/detail/${bb.id}`);
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
    const buyBack = event.data as BuyBack;
    logger.debug("Book Buyback Row Clicked", buyBack);
    toDetailPage(buyBack);
  };

  // When any of the list of params are changed, useEffect is called to hit the API endpoint
  useEffect(() => callAPI(), [sortParams, pageParams, isNoPagination]);

  const callAPI = () => {
    // Invert sort order
    let sortField = APIBBSortFieldMap.get(sortParams.sortField) ?? "";
    if (sortParams.sortOrder == -1) {
      sortField = "-".concat(sortField);
    }

    if (!isNoPagination) {
      BUYBACK_API.getBuyBacks({
        page: (pageParams.page ?? 0) + 1,
        page_size: pageParams.rows,
        ordering: sortField,
      }).then((response) => onAPIResponse(response));
    } else {
      BUYBACK_API.getBuyBacksNoPagination({
        no_pagination: true,
        ordering: sortField,
      }).then((response) => onAPIResponseNoPagination(response));
    }
  };

  // Set state when response to API call is received
  const onAPIResponseNoPagination = (response: APIBB[]) => {
    setBuyBacks(response.map((bb) => APIToInternalBBConversion(bb)));
    setNumberOfBuyBacks(response.length);
    setLoading(false);
  };

  // Set state when response to API call is received
  const onAPIResponse = (response: GetBBsResp) => {
    setBuyBacks(response.results.map((bb) => APIToInternalBBConversion(bb)));
    setNumberOfBuyBacks(response.count);
    setLoading(false);
  };

  // ----------------- TEMPLATES/VISIBLE COMPONENTS -----------------

  const toast = useRef<Toast>(null);

  const columns = createColumns(COLUMNS);

  const addBBButton = (
    <div className="flex justify-content-end col-3">
      <AddPageButton
        onClick={() => navigate("/book-buybacks/add")}
        label="Add Buyback"
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
        {addBBButton}
      </div>
      <div className="flex justify-content-center">
        <div className="card col-11 pt-0 px-3 justify-content-center">
          <Toast ref={toast} />
          <DataTable
            // General Settings
            showGridlines
            value={buyBacks}
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
            totalRecords={numberOfBuyBacks}
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
