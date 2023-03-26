import { Toast } from "primereact/toast";
import { useRef, useState } from "react";
import {
  APISRSortFieldMap,
  APIToInternalSRConversion,
} from "../../apis/sales/SalesConversions";
import { GetSRsResp, SALES_API } from "../../apis/sales/SalesAPI";
import { TableColumn } from "../../components/datatable/TableColumns";
import { DateTemplate } from "../../components/templates/DateTemplate";
import PriceTemplate from "../../components/templates/PriceTemplate";
import ListTemplate from "../../templates/list/ListTemplate";
import { LineItem } from "../../templates/inventorydetail/LineItemTableTemplate";
import SelectSizeDropdown, {
  SelectSizeDropdownOptions,
} from "../../components/dropdowns/SelectSizeDropdown";
import { showFailure } from "../../components/Toast";

export interface SalesRecord {
  id: string;
  date: Date;
  sales: LineItem[];
  uniqueBooks: number;
  totalBooks: number;
  totalRevenue: number;
  isDeletable: boolean;
}

const COLUMNS: TableColumn<SalesRecord>[] = [
  {
    field: "date",
    header: "Date (YYYY-MM-DD)",
    sortable: true,
    customBody: (rowData: SalesRecord) => DateTemplate(rowData.date),
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
    customBody: (rowData: SalesRecord) => PriceTemplate(rowData.totalRevenue),
    style: { minWidth: "8rem", width: "12rem" },
  },
];

export default function SalesRecordList() {
  // ----------------- STATE -----------------
  const [isLoading, setIsLoading] = useState<boolean>(false); // Whether we show that the table is loading or not
  const [numberOfSalesRecords, setNumberOfSalesRecords] = useState(0); // The number of elements that match the query
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([]); // The data displayed in the table
  const [isNoPagination, setIsNoPagination] = useState<boolean>(false);
  const [tableWhitespaceSize, setTableWhitespaceSize] =
    useState<SelectSizeDropdownOptions>(SelectSizeDropdownOptions.Small);

  // ----------------- METHODS -----------------

  const callAPI = (page: number, pageSize: number, sortField: string) => {
    SALES_API.getSalesRecords({
      page: page,
      page_size: pageSize,
      ordering: sortField,
    })
      .then((response) => onAPIResponse(response))
      .catch(() =>
        showFailure(toast, "Sales Records Retrieval Error Occurred")
      );
  };

  // Set state when response to API call is received
  const onAPIResponse = (response: GetSRsResp) => {
    setSalesRecords(
      response.results.map((sr) => APIToInternalSRConversion(sr))
    );
    setNumberOfSalesRecords(response.count);
    setIsLoading(false);
  };

  // ----------------- TEMPLATES/VISIBLE COMPONENTS -----------------
  const toast = useRef<Toast>(null);

  const selectSizeButton = (
    <SelectSizeDropdown
      value={tableWhitespaceSize}
      onChange={(e) => setTableWhitespaceSize(e.value)}
    />
  );

  const dataTable = (
    <ListTemplate
      columns={COLUMNS}
      detailPageURL="/sales-records/detail/"
      whitespaceSize={tableWhitespaceSize}
      isNoPagination={isNoPagination}
      setIsNoPagination={setIsNoPagination}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
      totalNumberOfEntries={numberOfSalesRecords}
      setTotalNumberOfEntries={setNumberOfSalesRecords}
      rows={salesRecords}
      APISortFieldMap={APISRSortFieldMap}
      callGetAPI={callAPI}
      paginatorLeft={<></>}
      paginatorRight={selectSizeButton}
    />
  );

  return (
    <div>
      <div className="flex justify-content-center">
        <div className="card col-9 pt-0 px-3 justify-content-center">
          <Toast ref={toast} />
          {dataTable}
        </div>
      </div>
    </div>
  );
}
