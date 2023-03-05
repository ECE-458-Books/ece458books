import { useRef, useState } from "react";
import { DateTemplate } from "../../components/templates/DateTemplate";
import PriceTemplate from "../../components/templates/PriceTemplate";
import { BBSaleRow } from "./BBDetail";
import { TableColumn } from "../../components/datatable/TableColumns";
import { Toast } from "primereact/toast";
import { APIBB, BUYBACK_API, GetBBsResp } from "../../apis/buybacks/BuyBackAPI";
import {
  APIBBSortFieldMap,
  APIToInternalBBConversion,
} from "../../apis/buybacks/BuybacksConversions";

import { useNavigate } from "react-router-dom";
import AddPageButton from "../../components/buttons/AddPageButton";
import LabeledSwitch from "../../components/buttons/LabeledSwitch";
import SelectSizeButton, {
  SelectSizeButtonOptions,
} from "../../components/buttons/SelectSizeButton";
import { IDer } from "../../util/IDOps";
import ListTemplate from "../../templates/list/ListTemplate";

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

const COLUMNS: TableColumn[] = [
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
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false); // Whether we show that the table is loading or not
  const [buybacks, setBuybacks] = useState<IDer[]>([]); // The rows of the table
  const [numberOfBuyBacks, setNumberOfBuyBacks] = useState<number>(0); // The total number of rows in the table

  const [isNoPagination, setIsNoPagination] = useState<boolean>(false);
  const [tableWhitespaceSize, setTableWhitespaceSize] =
    useState<SelectSizeButtonOptions>(SelectSizeButtonOptions.Small);

  const callAPI = (
    page: number | undefined,
    pageSize: number,
    sortField: string
  ) => {
    if (!isNoPagination) {
      BUYBACK_API.getBuyBacks({
        page: (page ?? 0) + 1,
        page_size: pageSize,
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
    setBuybacks(response.map((bb) => APIToInternalBBConversion(bb)));
    setNumberOfBuyBacks(response.length);
    setIsLoading(false);
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
      <SelectSizeButton
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
      isLoading={isLoading}
      setIsLoading={setIsLoading}
      totalNumberOfEntries={numberOfBuyBacks}
      setNumberOfRows={setNumberOfBuyBacks}
      rows={buybacks}
      setRows={setBuybacks}
      APISortFieldMap={APIBBSortFieldMap}
      callGetAPI={callAPI}
    />
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
          {dataTable}
        </div>
      </div>
    </div>
  );
}
