import { Toast } from "primereact/toast";
import { useRef, useState } from "react";
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
import { TableColumn } from "../../components/datatable/TableColumns";
import { DateTemplate } from "../../components/templates/DateTemplate";
import PriceTemplate from "../../components/templates/PriceTemplate";
import AddPageButton from "../../components/buttons/AddPageButton";
import LabeledSwitch from "../../components/buttons/LabeledSwitch";
import ListTemplate from "../../templates/list/ListTemplate";
import { LineItem } from "../../templates/inventorydetail/LineItemTableTemplate";
import SelectSizeDropdown, {
  SelectSizeDropdownOptions,
} from "../../components/buttons/SelectSizeDropdown";
import { scrollToTop } from "../../util/WindowViewportOps";

export interface PurchaseOrder {
  id: string;
  date: Date;
  vendorName: string;
  vendorId: number;
  creatorId: number;
  creatorName: string;
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
  {
    field: "creatorName",
    header: "Associated User",
    sortable: true,
    style: { minWidth: "8rem", width: "10rem" },
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
    if (!isNoPagination) {
      PURCHASES_API.getPurchaseOrders({
        page: page,
        page_size: pageSize,
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
    setIsLoading(false);
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
      detailPageURL="/purchase-orders/detail/"
      whitespaceSize={tableWhitespaceSize}
      isNoPagination={isNoPagination}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
      totalNumberOfEntries={numberOfPurchaseOrders}
      setTotalNumberOfEntries={setNumberOfPurchaseOrders}
      rows={purchaseOrders}
      APISortFieldMap={APIPOSortFieldMap}
      callGetAPI={callAPI}
      paginatorLeft={noPaginationSwitch}
      paginatorRight={selectSizeButton}
    />
  );

  return (
    <div>
      {isNoPagination && (
        <div className="grid flex justify-content-end m-1">
          <div className="flex col-4 justify-content-start mx-0 my-auto">
            {noPaginationSwitch}
          </div>
          <div className="flex col-4 justify-content-end my-1 m-0">
            {selectSizeButton}
          </div>
          <div className="flex justify-content-end col-2">{addPOButton}</div>
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
            {addPOButton}
          </div>
        )}
      </div>
    </div>
  );
}
