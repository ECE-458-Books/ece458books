import { useRef, useState } from "react";
import { DateTemplate } from "../../components/templates/DateTemplate";
import PriceTemplate from "../../components/templates/PriceTemplate";
import { TableColumn } from "../../components/datatable/TableColumns";
import { Toast } from "primereact/toast";
import { BUYBACK_API, GetBBsResp } from "../../apis/buybacks/BuyBackAPI";
import {
  APIBBSortFieldMap,
  APIToInternalBBConversion,
} from "../../apis/buybacks/BuybacksConversions";

import { useNavigate } from "react-router-dom";
import AddPageButton from "../../components/buttons/AddPageButton";
import ListTemplate from "../../templates/list/ListTemplate";
import { LineItem } from "../../templates/inventorydetail/LineItemTableTemplate";
import SelectSizeDropdown, {
  SelectSizeDropdownOptions,
} from "../../components/dropdowns/SelectSizeDropdown";

export interface BuyBack {
  id: string;
  date: Date;
  vendorID: number;
  vendorName: string;
  creatorId: number;
  creatorName: string;
  sales: LineItem[];
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
  {
    field: "creatorName",
    header: "Associated User",
    sortable: true,
    style: { minWidth: "8rem", width: "10rem" },
  },
];

export default function BuyBackList() {
  // ----------------- STATE -----------------
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false); // Whether we show that the table is loading or not
  const [buybacks, setBuybacks] = useState<BuyBack[]>([]); // The rows of the table
  const [numberOfBuyBacks, setNumberOfBuyBacks] = useState<number>(0); // The total number of rows in the table

  const [isNoPagination, setIsNoPagination] = useState<boolean>(false);
  const [tableWhitespaceSize, setTableWhitespaceSize] =
    useState<SelectSizeDropdownOptions>(SelectSizeDropdownOptions.Small);

  const callAPI = (page: number, pageSize: number, sortField: string) => {
    BUYBACK_API.getBuyBacks({
      page: page,
      page_size: pageSize,
      ordering: sortField,
    }).then((response) => onAPIResponse(response));
  };

  // Set state when response to API call is received
  const onAPIResponse = (response: GetBBsResp) => {
    setBuybacks(response.results.map((bb) => APIToInternalBBConversion(bb)));
    setNumberOfBuyBacks(response.count);
    setIsLoading(false);
  };

  // ----------------- TEMPLATES/VISIBLE COMPONENTS -----------------

  const toast = useRef<Toast>(null);

  const addBBButton = (
    <AddPageButton
      onClick={() => navigate("/book-buybacks/add")}
      label="Add Buyback"
      className="mr-2"
    />
  );

  const selectSizeButton = (
    <div className="col-3">
      <SelectSizeDropdown
        value={tableWhitespaceSize}
        onChange={(e) => setTableWhitespaceSize(e.value)}
      />
    </div>
  );

  const dataTable = (
    <ListTemplate
      columns={COLUMNS}
      detailPageURL="/book-buybacks/detail/"
      whitespaceSize={tableWhitespaceSize}
      isNoPagination={isNoPagination}
      setIsNoPagination={setIsNoPagination}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
      totalNumberOfEntries={numberOfBuyBacks}
      setTotalNumberOfEntries={setNumberOfBuyBacks}
      rows={buybacks}
      APISortFieldMap={APIBBSortFieldMap}
      callGetAPI={callAPI}
      paginatorLeft={<></>}
      paginatorRight={selectSizeButton}
    />
  );

  return (
    <div>
      <div className="flex justify-content-end">
        <div className="card col-9 pt-0 px-3 justify-content-center">
          <Toast ref={toast} />
          {dataTable}
        </div>
        <div
          className="flex justify-content-end align-items-start mr-1 my-2"
          style={{ width: "12.4%" }}
        >
          {addBBButton}
        </div>
      </div>
    </div>
  );
}
