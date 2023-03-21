import { useRef, useState } from "react";
import { DateTemplate } from "../../components/templates/DateTemplate";
import PriceTemplate from "../../components/templates/PriceTemplate";
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
import ListTemplate from "../../templates/list/ListTemplate";
import { LineItem } from "../../templates/inventorydetail/LineItemTableTemplate";
import SelectSizeDropdown, {
  SelectSizeDropdownOptions,
} from "../../components/buttons/SelectSizeDropdown";
import { scrollToTop } from "../../util/WindowViewportOps";

export interface BuyBack {
  id: string;
  date: Date;
  vendorID: number;
  vendorName: string;
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
    if (!isNoPagination) {
      BUYBACK_API.getBuyBacks({
        page: page,
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
    <AddPageButton
      onClick={() => navigate("/book-buybacks/add")}
      label="Add Buyback"
      className="mr-2"
    />
  );

  const noPaginationSwitch = (
    <LabeledSwitch
      label="Show All"
      onChange={() => {
        if (!isNoPagination) {
          scrollToTop();
        }
        setIsNoPagination(!isNoPagination);
      }}
      value={isNoPagination}
    />
  );

  const selectSizeButton = (
    <SelectSizeDropdown
      value={tableWhitespaceSize}
      onChange={(e) => setTableWhitespaceSize(e.value)}
    />
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
      setTotalNumberOfEntries={setNumberOfBuyBacks}
      rows={buybacks}
      APISortFieldMap={APIBBSortFieldMap}
      callGetAPI={callAPI}
      paginatorLeft={noPaginationSwitch}
      paginatorRight={selectSizeButton}
    />
  );

  return (
    <div>
      {isNoPagination && (
        <div className="grid flex m-1 justify-content-end">
          <div className="flex col-4 justify-content-start mx-0 my-auto">
            {noPaginationSwitch}
          </div>
          <div className="flex col-4 justify-content-end m-0">
            {selectSizeButton}
          </div>
          <div className="flex justify-content-end col-2">{addBBButton}</div>
        </div>
      )}
      <div
        className={
          !isNoPagination
            ? "flex justify-content-end"
            : "flex justify-content-center"
        }
      >
        <div className="card col-9 pt-0 px-3 justify-content-center">
          <Toast ref={toast} />
          {dataTable}
        </div>
        {!isNoPagination && (
          <div
            className="flex justify-content-end align-items-start mr-1 my-2"
            style={{ width: "12.4%" }}
          >
            {addBBButton}
          </div>
        )}
      </div>
    </div>
  );
}
