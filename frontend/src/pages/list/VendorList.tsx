import { Column } from "primereact/column";
import {
  DataTable,
  DataTablePageEvent,
  DataTableRowClickEvent,
  DataTableSortEvent,
} from "primereact/datatable";
import { Toast } from "primereact/toast";
import React from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { APIToInternalVendorConversion } from "../../apis/Conversions";
import { APIVendor, GetVendorsResp, VENDORS_API } from "../../apis/VendorsAPI";
import DeletePopup from "../../components/popups/DeletePopup";
import { createColumns, TableColumn } from "../../components/TableColumns";
import EditDeleteTemplate from "../../util/EditDeleteTemplate";
import { logger } from "../../util/Logger";
import { percentBodyTemplate } from "../../util/TableCellEditFuncs";
import { NUM_ROWS } from "./BookList";
import AddPageButton from "../../components/buttons/AddPageButton";
import LabeledSwitch from "../../components/buttons/LabeledSwitch";
import SelectSizeButton, {
  SelectSizeButtonOptions,
} from "../../components/buttons/SelectSizeButton";
import { isHighlightingText } from "../../util/ClickCheck";

// The Vendor Interface
export interface Vendor {
  id: string;
  name: string;
  buybackRate?: number;
  numPO: number;
}

// Properties of each column that change, the rest are set below when creating the actual Columns to be rendered
const COLUMNS: TableColumn[] = [
  {
    field: "name",
    header: "Vendor Name",
    sortable: true,
    style: { minWidth: "8rem", width: "16rem" },
  },
  {
    field: "buybackRate",
    header: "Buyback Rate",
    sortable: true,
    customBody: (rowData: Vendor) =>
      rowData.buybackRate
        ? percentBodyTemplate(rowData.buybackRate)
        : undefined,
    style: { minWidth: "8rem", width: "12rem" },
  },
];

// Empty vendor, used to initialize state
const emptyVendor: Vendor = {
  id: "0",
  name: "",
  numPO: 0,
};

export default function VendorList() {
  // ----------------- STATE -----------------
  const [loading, setLoading] = useState<boolean>(false); // Whether we show that the table is loading or not
  const [numberOfVendors, setNumberOfVendors] = useState<number>(0); // The number of elements that match the query
  const [vendors, setVendors] = useState<Vendor[]>([]); // The data displayed in the table
  const [deletePopupVisible, setDeletePopupVisible] = useState<boolean>(false); // Whether the delete popup is shown
  const [selectedDeleteVendor, setSelectedDeleteVendor] =
    useState<Vendor>(emptyVendor); // The element that has been clicked on to delete

  const [rows, setRows] = useState<number>(NUM_ROWS);
  const [isNoPagination, setIsNoPagination] = useState<boolean>(false);
  const [size, setSize] = useState<SelectSizeButtonOptions>(
    SelectSizeButtonOptions.Small
  );

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
  const editVendor = (vendor: Vendor) => {
    logger.debug("Edit Vendor Clicked", vendor);
    navigate(`/vendors/detail/${vendor.id}`);
  };

  // Called to make delete pop up show
  const deleteVendorPopup = (vendor: Vendor) => {
    logger.debug("Delete Vendor Clicked", vendor);
    setSelectedDeleteVendor(vendor);
    setDeletePopupVisible(true);
  };

  // Call to actually delete the element
  const deleteVendorFinal = () => {
    logger.debug("Delete Vendor Finalized", selectedDeleteVendor);
    setDeletePopupVisible(false);
    VENDORS_API.deleteVendor({ id: selectedDeleteVendor.id })
      .then(() => showSuccess())
      .catch(() => {
        showFailure();
        return;
      });
    const _vendors = vendors.filter(
      (selectVendor) => selectedDeleteVendor.id != selectVendor.id
    );
    setVendors(_vendors);
    setSelectedDeleteVendor(emptyVendor);
  };

  // Called when any of the columns are selected to be sorted
  const onSort = (event: DataTableSortEvent) => {
    logger.debug("Sort Applied", event);
    setLoading(true);
    setSortParams(event);
  };

  // Called when the paginator page is switched
  const onPage = (event: DataTablePageEvent) => {
    logger.debug("Page Applied", event);
    setRows(event.rows);
    setLoading(true);
    setPageParams(event);
  };

  // When any of the list of params are changed, useEffect is called to hit the API endpoint
  useEffect(() => callAPI(), [sortParams, pageParams, isNoPagination]);

  // Calls the Vendors API
  const callAPI = () => {
    // Invert sort order
    let sortField = sortParams.sortField;
    if (sortParams.sortOrder == -1) {
      sortField = "-".concat(sortField);
    }

    if (!isNoPagination) {
      VENDORS_API.getVendors({
        page: (pageParams.page ?? 0) + 1,
        page_size: pageParams.rows,
        ordering: sortField,
      }).then((response) => onAPIResponse(response));
    } else {
      VENDORS_API.getVendorsNoPagination().then((response) =>
        onAPIResponseNoPagination(response)
      );
    }
  };

  // Set state when response to API call is received
  const onAPIResponseNoPagination = (response: APIVendor[]) => {
    setVendors(response.map((vendor) => APIToInternalVendorConversion(vendor)));
    setNumberOfVendors(response.length);
    setLoading(false);
  };

  // Set state when response to API call is received
  const onAPIResponse = (response: GetVendorsResp) => {
    setVendors(
      response.results.map((vendor) => APIToInternalVendorConversion(vendor))
    );
    setNumberOfVendors(response.count);
    setLoading(false);
  };

  // ----------------- TEMPLATES/VISIBLE COMPONENTS -----------------

  // Whether the delete button should be disabled
  const isDeleteDisabled = (vendor: Vendor) => {
    return vendor.numPO > 0;
  };

  // Edit/Delete Cell Template
  const editDeleteCellTemplate = EditDeleteTemplate<Vendor>({
    onEdit: (rowData) => editVendor(rowData),
    onDelete: (rowData) => deleteVendorPopup(rowData),
    deleteDisabled: (rowData) => isDeleteDisabled(rowData),
  });

  // The delete popup
  const deletePopup = (
    <DeletePopup
      deleteItemIdentifier={selectedDeleteVendor.name}
      onConfirm={() => deleteVendorFinal()}
      setIsVisible={setDeletePopupVisible}
    />
  );

  const onRowClick = (event: DataTableRowClickEvent) => {
    if (isHighlightingText()) return;
    const vendor = event.data as Vendor;
    logger.debug("Vendor Row Clicked", vendor);
    editVendor(vendor);
  };

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  const showSuccess = () => {
    toast.current?.show({ severity: "success", summary: "Vendor Deleted" });
  };

  const showFailure = () => {
    toast.current?.show({
      severity: "error",
      summary: "Vendor could not be deleted",
    });
  };

  const columns = createColumns(COLUMNS);

  const addVendorButton = (
    <div className="flex justify-content-end col-3">
      <AddPageButton
        onClick={() => navigate("/vendors/add")}
        label="Add Vendor"
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
        {addVendorButton}
      </div>
      <div className="flex justify-content-center">
        <div className="card col-8 pt-0 px-3 justify-content-center">
          <Toast ref={toast} />
          <DataTable
            // General Settings
            showGridlines
            value={vendors}
            lazy
            responsiveLayout="scroll"
            loading={loading}
            size={size}
            // Row clicking
            rowHover
            selectionMode={"single"}
            onRowClick={(event) => onRowClick(event)}
            // Paginator
            paginator={!isNoPagination}
            first={pageParams.first}
            rows={rows}
            totalRecords={numberOfVendors}
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
