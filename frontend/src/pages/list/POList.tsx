import { Column } from "primereact/column";
import {
  DataTable,
  DataTablePageEvent,
  DataTableRowClickEvent,
  DataTableSortEvent,
} from "primereact/datatable";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  APIPOSortFieldMap,
  APIToInternalPOConversion,
} from "../../apis/Conversions";
import { APIPO, GetPOsResp, PURCHASES_API } from "../../apis/PurchasesAPI";
import DeletePopup from "../../components/popups/DeletePopup";
import { createColumns, TableColumn } from "../../components/TableColumns";
import EditDeleteTemplate from "../../util/EditDeleteTemplate";
import { logger } from "../../util/Logger";
import {
  dateBodyTemplate,
  priceBodyTemplate,
} from "../../util/TableCellEditFuncs";
import { POPurchaseRow } from "../detail/PODetail";
import { NUM_ROWS } from "./BookList";
import AddPageButton from "../../components/buttons/AddPageButton";
import LabeledSwitch from "../../components/buttons/LabeledSwitch";
import SelectSizeButton from "../../components/buttons/SelectSizeButton";

export interface PurchaseOrder {
  id: string;
  date: Date;
  vendorName: string;
  vendorId: number;
  uniqueBooks: number;
  totalBooks: number;
  totalCost: number;
  purchases: POPurchaseRow[];
}

const COLUMNS: TableColumn[] = [
  {
    field: "date",
    header: "Date (YYYY-MM-DD)",
    sortable: true,
    customBody: (rowData: PurchaseOrder) => dateBodyTemplate(rowData.date),
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
    customBody: (rowData: PurchaseOrder) =>
      priceBodyTemplate(rowData.totalCost),
    style: { minWidth: "8rem", width: "12rem" },
  },
];

// Empty purchase order, used to initialize state
const emptyPurchaseOrder: PurchaseOrder = {
  id: "0",
  date: new Date(),
  vendorName: "",
  vendorId: 0,
  uniqueBooks: 0,
  totalBooks: 0,
  totalCost: 0,
  purchases: [],
};

export default function PurchaseOrderList() {
  // ----------------- STATE -----------------
  const [loading, setLoading] = useState<boolean>(false); // Whether we show that the table is loading or not
  const [numberOfPurchaseOrders, setNumberOfPurchaseOrders] =
    useState<number>(0); // The number of elements that match the query
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]); // The data displayed in the table
  const [deletePopupVisible, setDeletePopupVisible] = useState<boolean>(false); // Whether the delete popup is shown
  const [selectedDeletePurchaseOrder, setSelectedDeletePurchaseOrder] =
    useState<PurchaseOrder>(emptyPurchaseOrder); // The element that has been clicked on to delete

  const [rows, setRows] = useState<number>(NUM_ROWS);
  const [isNoPagination, setIsNoPagination] = useState<boolean>(false);
  const [size, setSize] = useState<string>("small");

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
  const toDetailPage = (po: PurchaseOrder) => {
    logger.debug("Edit Purchase Order Clicked", po);
    navigate(`/purchase-orders/detail/${po.id}`);
  };

  // Called to make delete pop up show
  const deletePurchaseOrderPopup = (po: PurchaseOrder) => {
    logger.debug("Delete Purchase Order Clicked", po);
    setSelectedDeletePurchaseOrder(po);
    setDeletePopupVisible(true);
  };

  // Call to actually delete the element
  const deletePurchaseOrderFinal = () => {
    logger.debug("Edit Purchase Order Finalized", selectedDeletePurchaseOrder);
    setDeletePopupVisible(false);
    PURCHASES_API.deletePurchaseOrder({
      id: selectedDeletePurchaseOrder.id,
    })
      .then(() => showSuccess())
      .catch(() => showFailure());
    const _purchaseOrders = purchaseOrders.filter(
      (selectPO) => selectedDeletePurchaseOrder.id != selectPO.id
    );
    setPurchaseOrders(_purchaseOrders);
    setSelectedDeletePurchaseOrder(emptyPurchaseOrder);
  };

  // Called when any of the columns are selected to be sorted
  const onSort = (event: DataTableSortEvent) => {
    logger.debug("Page Applied", event);
    setLoading(true);
    setSortParams(event);
  };

  // Called when the paginator page is switched
  const onPage = (event: DataTablePageEvent) => {
    logger.debug("Sort Applied", event);
    setRows(event.rows);
    setLoading(true);
    setPageParams(event);
  };

  const onRowClick = (event: DataTableRowClickEvent) => {
    const purchaseOrder = event.data as PurchaseOrder;
    logger.debug("Purchase Order Row Clicked", purchaseOrder);
    toDetailPage(purchaseOrder);
  };

  // When any of the list of params are changed, useEffect is called to hit the API endpoint
  useEffect(() => callAPI(), [sortParams, pageParams, isNoPagination]);

  // Calls the Vendors API
  const callAPI = () => {
    // Invert sort order
    let sortField = APIPOSortFieldMap.get(sortParams.sortField) ?? "";
    if (sortParams.sortOrder == -1) {
      sortField = "-".concat(sortField);
    }

    if (!isNoPagination) {
      PURCHASES_API.getPurchaseOrders({
        page: (pageParams.page ?? 0) + 1,
        page_size: pageParams.rows,
        ordering: sortField,
      }).then((response) => {
        return onAPIResponse(response);
      });
    } else {
      PURCHASES_API.getPurchaseOrdersNoPagination().then((response) =>
        onAPIResponseNoPagination(response)
      );
    }
  };

  // Set state when response to API call is received
  const onAPIResponseNoPagination = (response: APIPO[]) => {
    setPurchaseOrders(response.map((po) => APIToInternalPOConversion(po)));
    setNumberOfPurchaseOrders(response.length);
    setLoading(false);
  };

  // Set state when response to API call is received
  const onAPIResponse = (response: GetPOsResp) => {
    setPurchaseOrders(
      response.results.map((po) => APIToInternalPOConversion(po))
    );
    setNumberOfPurchaseOrders(response.count);
    setLoading(false);
  };

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  const showSuccess = () => {
    toast.current?.show({
      severity: "success",
      summary: "Purchase order deleted",
    });
  };

  const showFailure = () => {
    toast.current?.show({
      severity: "error",
      summary:
        "Purchase order could not be deleted, not all book inventory counts are 0",
    });
  };

  // ----------------- TEMPLATES/VISIBLE COMPONENTS -----------------

  // Edit/Delete Cell Template
  const editDeleteCellTemplate = EditDeleteTemplate<PurchaseOrder>({
    onEdit: (rowData) => toDetailPage(rowData),
    onDelete: (rowData) => deletePurchaseOrderPopup(rowData),
    deleteDisabled: () => false,
  });

  // The delete popup
  const deletePopup = (
    <DeletePopup
      deleteItemIdentifier={"this purchase order"}
      onConfirm={() => deletePurchaseOrderFinal()}
      setIsVisible={setDeletePopupVisible}
    />
  );

  const columns = createColumns(COLUMNS);

  const addPOButton = (
    <div className="flex justify-content-end col-3">
      <AddPageButton
        onClick={() => navigate("/purchase-orders/add")}
        label="Add Order"
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
        {addPOButton}
      </div>
      <div className="flex justify-content-center">
        <div className="card col-11 pt-0 px-3 justify-content-center">
          <Toast ref={toast} />
          <DataTable
            showGridlines
            // General Settings
            value={purchaseOrders}
            lazy
            responsiveLayout="scroll"
            loading={loading}
            size={size ?? "small"}
            // Row clicking
            rowHover
            selectionMode={"single"}
            onRowClick={(event) => onRowClick(event)}
            // Paginator
            paginator={!isNoPagination}
            first={pageParams.first}
            rows={rows}
            totalRecords={numberOfPurchaseOrders}
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
            <Column
              hidden
              body={editDeleteCellTemplate}
              style={{ minWidth: "4rem" }}
            />
          </DataTable>
          {deletePopupVisible && deletePopup}
        </div>
      </div>
    </div>
  );
}
