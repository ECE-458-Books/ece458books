import { Toast } from "primereact/toast";
import { TableColumn, createColumns } from "../../components/TableColumns";
import {
  DataTable,
  DataTablePageEvent,
  DataTableSortEvent,
} from "primereact/datatable";
import { Column } from "primereact/column";
import { useEffect, useRef, useState } from "react";
import { NUM_ROWS } from "./BookList";
import { logger } from "../../util/Logger";
import { useNavigate } from "react-router-dom";
import { BUYBACK_API, GetBBsResp } from "../../apis/BuyBackAPI";
import {
  APIBBSortFieldMap,
  APIToInternalBBConversion,
} from "../../apis/Conversions";
import { BBSaleRow } from "../detail/BBDetail";

export interface BuyBack {
  id: number;
  date: Date;
  buyBacks: BBSaleRow[];
  vendorId: number;
  vendorName: string;
  uniqueBooks: number;
  totalBooks: number;
  totalRevenue: number;
}

// Empty sales reconciliation, used to initialize state
const emptyBuyBack: BuyBack = {
  id: 0,
  date: new Date(),
  buyBacks: [],
  uniqueBooks: 0,
  totalBooks: 0,
  totalRevenue: 0,
  vendorId: 0,
  vendorName: "",
};

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
    field: "totalRevenue",
    header: "Total Revenue ($)",
    sortable: true,
  },
];

export default function BuyBackList() {
  // ----------------- STATE -----------------
  const [loading, setLoading] = useState<boolean>(false); // Whether we show that the table is loading or not
  const [numberOfBuyBacks, setNumberOfBuyBacks] = useState(0); // The number of elements that match the query
  const [buyBacks, setBuyBacks] = useState<BuyBack[]>([]); // The data displayed in the table
  const [deletePopupVisible, setDeletePopupVisible] = useState<boolean>(false); // Whether the delete popup is shown
  const [selectedDeleteBuyBack, setSelectedDeleteBuyBack] =
    useState<BuyBack>(emptyBuyBack); // The element that has been clicked on to delete

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
  // const toDetailPage = (sr: SalesReconciliation, isModifiable: boolean) => {
  //   logger.debug("Edit Sales Reconciliation Clicked", sr);
  //   const detailState: SRDetailState = {
  //     id: sr.id,
  //     isAddPage: false,
  //     isModifiable: isModifiable,
  //   };

  //   navigate("/sales-reconciliations/detail", { state: detailState });
  // };

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
  useEffect(() => callAPI(), [sortParams, pageParams]);

  const callAPI = () => {
    // Invert sort order
    let sortField = APIBBSortFieldMap.get(sortParams.sortField) ?? "";
    if (sortParams.sortOrder == -1) {
      sortField = "-".concat(sortField);
    }

    BUYBACK_API.getBuyBacks({
      page: (pageParams.page ?? 0) + 1,
      page_size: pageParams.rows,
      ordering: sortField,
    }).then((response) => onAPIResponse(response));
  };

  // Set state when response to API call is received
  const onAPIResponse = (response: GetBBsResp) => {
    setBuyBacks(response.results.map((bb) => APIToInternalBBConversion(bb)));
    setNumberOfBuyBacks(response.count);
    setLoading(false);
  };

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  const columns = createColumns(COLUMNS);

  return (
    <div className="card pt-5 px-2">
      <Toast ref={toast} />
      <DataTable
        showGridlines
        // General Settings
        value={buyBacks}
        lazy
        responsiveLayout="scroll"
        loading={loading}
        // Row clicking
        rowHover
        selectionMode={"single"}
        //onRowClick={(event) => onRowClick(event)}
        // Paginator
        paginator
        first={pageParams.first}
        rows={NUM_ROWS}
        totalRecords={numberOfBuyBacks}
        paginatorTemplate="PrevPageLink NextPageLink"
        onPage={onPage}
        // Sorting
        onSort={onSort}
        sortField={sortParams.sortField}
        sortOrder={sortParams.sortOrder}
      >
        {columns}
        {/* <Column body={editDeleteCellTemplate} style={{ minWidth: "16rem" }} /> */}
      </DataTable>
      {/* {deletePopupVisible && deletePopup} */}
    </div>
  );
}
