import { Toast } from "primereact/toast";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  APISRSortFieldMap,
  APIToInternalSRConversion,
} from "../../apis/sales/SalesConversions";
import { APISR, GetSRsResp, SALES_API } from "../../apis/sales/SalesAPI";
import { TableColumn } from "../../components/datatable/TableColumns";
import { DateTemplate } from "../../components/templates/DateTemplate";
import PriceTemplate from "../../components/templates/PriceTemplate";
import AddPageButton from "../../components/buttons/AddPageButton";
import ListTemplate from "../../templates/list/ListTemplate";
import { LineItem } from "../../templates/inventorydetail/LineItemTableTemplate";
import SelectSizeDropdown, {
  SelectSizeDropdownOptions,
} from "../../components/dropdowns/SelectSizeDropdown";

export interface SalesReconciliation {
  id: string;
  date: Date;
  sales: LineItem[];
  uniqueBooks: number;
  totalBooks: number;
  totalRevenue: number;
  isDeletable: boolean;
}

const COLUMNS: TableColumn<SalesReconciliation>[] = [
  {
    field: "date",
    header: "Date (YYYY-MM-DD)",
    sortable: true,
    customBody: (rowData: SalesReconciliation) => DateTemplate(rowData.date),
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
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false); // Whether we show that the table is loading or not
  const [numberOfSalesReconciliations, setNumberOfSalesReconciliations] =
    useState(0); // The number of elements that match the query
  const [salesReconciliations, setSalesReconciliations] = useState<
    SalesReconciliation[]
  >([]); // The data displayed in the table
  const [isNoPagination, setIsNoPagination] = useState<boolean>(false);
  const [tableWhitespaceSize, setTableWhitespaceSize] =
    useState<SelectSizeDropdownOptions>(SelectSizeDropdownOptions.Small);

  // ----------------- METHODS -----------------

  const callAPI = (page: number, pageSize: number, sortField: string) => {
    if (!isNoPagination) {
      SALES_API.getSalesReconciliations({
        page: page,
        page_size: pageSize,
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
    setIsLoading(false);
  };

  // Set state when response to API call is received
  const onAPIResponse = (response: GetSRsResp) => {
    setSalesReconciliations(
      response.results.map((sr) => APIToInternalSRConversion(sr))
    );
    setNumberOfSalesReconciliations(response.count);
    setIsLoading(false);
  };

  // ----------------- TEMPLATES/VISIBLE COMPONENTS -----------------
  const toast = useRef<Toast>(null);

  const addSRButton = (
    <AddPageButton
      onClick={() => navigate("/sales-reconciliations/add")}
      label="Add Sale"
      className="mr-2"
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
      detailPageURL="/sales-reconciliations/detail/"
      whitespaceSize={tableWhitespaceSize}
      isNoPagination={isNoPagination}
      setIsNoPagination={setIsNoPagination}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
      totalNumberOfEntries={numberOfSalesReconciliations}
      setTotalNumberOfEntries={setNumberOfSalesReconciliations}
      rows={salesReconciliations}
      APISortFieldMap={APISRSortFieldMap}
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
          {addSRButton}
        </div>
      </div>
    </div>
  );
}
