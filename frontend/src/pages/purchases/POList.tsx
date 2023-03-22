import { Toast } from "primereact/toast";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  APIPOSortFieldMap,
  APIToInternalPOConversion,
} from "../../apis/purchases/PurchasesConversions";
import { GetPOsResp, PURCHASES_API } from "../../apis/purchases/PurchasesAPI";
import { TableColumn } from "../../components/datatable/TableColumns";
import { DateTemplate } from "../../components/templates/DateTemplate";
import PriceTemplate from "../../components/templates/PriceTemplate";
import AddPageButton from "../../components/buttons/AddPageButton";
import ListTemplate from "../../templates/list/ListTemplate";
import { LineItem } from "../../templates/inventorydetail/LineItemTableTemplate";
import SelectSizeDropdown, {
  SelectSizeDropdownOptions,
} from "../../components/dropdowns/SelectSizeDropdown";

export interface PurchaseOrder {
  id: string;
  date: Date;
  vendorName: string;
  vendorId: number;
  uniqueBooks: number;
  totalBooks: number;
  totalCost: number;
  isDeletable: boolean;
  purchases: LineItem[];
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
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false); // Whether we show that the table is loading or not
  const [numberOfPurchaseOrders, setNumberOfPurchaseOrders] =
    useState<number>(0); // The number of elements that match the query
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]); // The data displayed in the table
  const [isNoPagination, setIsNoPagination] = useState<boolean>(false);
  const [tableWhitespaceSize, setTableWhitespaceSize] =
    useState<SelectSizeDropdownOptions>(SelectSizeDropdownOptions.Small);

  // ----------------- METHODS -----------------

  const callAPI = (page: number, pageSize: number, sortField: string) => {
    PURCHASES_API.getPurchaseOrders({
      page: page,
      page_size: pageSize,
      ordering: sortField,
    }).then((response) => {
      return onAPIResponse(response);
    });
  };

  // Set state when response to API call is received
  const onAPIResponse = (response: GetPOsResp) => {
    setPurchaseOrders(
      response.results.map((po) => APIToInternalPOConversion(po))
    );
    setNumberOfPurchaseOrders(response.count);
    setIsLoading(false);
  };

  // ----------------- TEMPLATES/VISIBLE COMPONENTS -----------------
  const toast = useRef<Toast>(null);

  const addPOButton = (
    <AddPageButton
      onClick={() => navigate("/purchase-orders/add")}
      label="Add Order"
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
      detailPageURL="/purchase-orders/detail/"
      whitespaceSize={tableWhitespaceSize}
      isNoPagination={isNoPagination}
      setIsNoPagination={setIsNoPagination}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
      totalNumberOfEntries={numberOfPurchaseOrders}
      setTotalNumberOfEntries={setNumberOfPurchaseOrders}
      rows={purchaseOrders}
      APISortFieldMap={APIPOSortFieldMap}
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
          {addPOButton}
        </div>
      </div>
    </div>
  );
}
