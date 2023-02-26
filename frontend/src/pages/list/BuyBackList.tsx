import { useEffect, useRef, useState } from "react";
import {
  dateBodyTemplate,
  priceBodyTemplate,
} from "../../util/TableCellEditFuncs";
import { BBSaleRow } from "../detail/BBDetail";
import { TableColumn, createColumns } from "../../components/TableColumns";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { BUYBACK_API, GetBBsResp } from "../../apis/BuyBackAPI";
import { APIToInternalBBConversion } from "../../apis/Conversions";

export interface BuyBack {
  id: string;
  date: Date;
  vendorID: number;
  vendorName: string;
  sales: BBSaleRow[];
  uniqueBooks: number;
  totalBooks: number;
  totalRevenue: number;
}

const COLUMNS: TableColumn[] = [
  {
    field: "date",
    header: "Date (YYYY-MM-DD)",
    sortable: true,
    customBody: (rowData: BuyBack) => dateBodyTemplate(rowData.date),
  },
  {
    field: "vendorName",
    header: "Vendor",
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
    customBody: (rowData: BuyBack) => priceBodyTemplate(rowData.totalRevenue),
  },
];

// Empty sales reconciliation, used to initialize state
const emptyBuyBack: BuyBack = {
  id: "0",
  date: new Date(),
  vendorID: 0,
  vendorName: "",
  sales: [],
  uniqueBooks: 0,
  totalBooks: 0,
  totalRevenue: 0,
};

export default function BuyBackList() {
  // ----------------- STATE -----------------
  const [loading, setLoading] = useState<boolean>(false); // Whether we show that the table is loading or not
  const [numberOfBuyBacks, setNumberOfBuyBacks] = useState(0); // The number of elements that match the query
  const [buyBacks, setBuyBacks] = useState<BuyBack[]>([]); // The data displayed in the table
  const [deletePopupVisible, setDeletePopupVisible] = useState<boolean>(false); // Whether the delete popup is shown
  const [selectedDeleteBuyBack, setSelectedDeleteBuyBack] =
    useState<BuyBack>(emptyBuyBack); // The element that has been clicked on to delete

  // When any of the list of params are changed, useEffect is called to hit the API endpoint
  useEffect(() => callAPI(), []);

  const callAPI = () => {
    // Invert sort order
    // let sortField = APISRSortFieldMap.get(sortParams.sortField) ?? "";
    // if (sortParams.sortOrder == -1) {
    //   sortField = "-".concat(sortField);
    // }

    BUYBACK_API.getBuyBacksTEST().then((response) => onAPIResponse(response));

    // SALES_API.getBuyBacks({
    //   page: (pageParams.page ?? 0) + 1,
    //   page_size: pageParams.rows,
    //   ordering: sortField,
    // }).then((response) => onAPIResponse(response));
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
        // General Settings
        showGridlines
        value={buyBacks}
        lazy
        responsiveLayout="scroll"
        loading={loading}
        // Row clicking
        // rowHover
        // selectionMode={"single"}
        // onRowClick={(event) => onRowClick(event)}
        // Paginator
        paginator
        // first={pageParams.first}
        // rows={NUM_ROWS}
        // totalRecords={numberOfBuyBacks}
        // paginatorTemplate="PrevPageLink NextPageLink"
        // onPage={onPage}
        // Sorting
        // onSort={onSort}
        // sortField={sortParams.sortField}
        // sortOrder={sortParams.sortOrder}
      >
        {columns}
        {/* <Column body={editDeleteCellTemplate} style={{ minWidth: "16rem" }} /> */}
      </DataTable>
      {/* {deletePopupVisible && deletePopup} */}
    </div>
  );
}
