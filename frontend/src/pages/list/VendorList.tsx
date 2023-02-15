import { Button } from "primereact/button";
import { Column } from "primereact/column";
import {
  DataTable,
  DataTableFilterEvent,
  DataTableFilterMetaData,
  DataTablePageEvent,
  DataTableSortEvent,
} from "primereact/datatable";
import { Toast } from "primereact/toast";
import React from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { APIToInternalVendorConversion } from "../../apis/Conversions";
import { GetVendorsResp, VENDORS_API } from "../../apis/VendorsAPI";
import DeletePopup from "../../components/DeletePopup";
import { TableColumn } from "../../components/Table";
import { logger } from "../../util/Logger";
import { VendorDetailState } from "../detail/VendorDetail";
import { NUM_ROWS } from "./BookList";

// The Vendor Interface
export interface Vendor {
  id: number;
  name: string;
  numPO: number;
}

// Properties of each column that change, the rest are set below when creating the actual Columns to be rendered
const COLUMNS: TableColumn[] = [
  {
    field: "name",
    header: "Vendor Name",
    filterPlaceholder: "Search by Name",
    filterable: false,
  },
];

// Define the column filters
interface Filters {
  [id: string]: DataTableFilterMetaData;
  name: DataTableFilterMetaData;
}

// Empty vendor, used to initialize state
const emptyVendor = {
  id: 0,
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

  // The current state of sorting.
  const [sortParams, setSortParams] = useState<DataTableSortEvent>({
    sortField: "",
    sortOrder: null,
    multiSortMeta: null, // Not used
  });

  // The current state of the paginator
  const [pageParams, setPageParams] = useState<DataTablePageEvent>({
    first: 0,
    rows: NUM_ROWS,
    page: 0,
  });

  // The current state of the filters
  const [filterParams, setFilterParams] = useState<any>({
    filters: {
      id: { value: "", matchMode: "contains" },
      name: { value: "", matchMode: "contains" },
    } as Filters,
  });

  // ----------------- METHODS -----------------

  // The navigator to switch pages
  const navigate = useNavigate();

  // Callback functions for edit/delete buttons
  const editVendor = (vendor: Vendor) => {
    logger.debug("Edit Vendor Clicked", vendor);
    const detailState: VendorDetailState = {
      id: vendor.id,
      vendor: vendor.name,
      isModifiable: true,
      isConfirmationPopupVisible: false,
    };

    navigate("/vendors/detail", { state: detailState });
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

  // Called when any of the filters (search boxes) are typed into
  const onFilter = (event: DataTableFilterEvent) => {
    logger.debug("Filter Applied", event);
    setLoading(true);
    setFilterParams(event);
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
    setLoading(true);
    setPageParams(event);
  };

  // When any of the list of params are changed, useEffect is called to hit the API endpoint
  useEffect(() => callAPI(), [sortParams, pageParams, filterParams]);

  // Calls the Vendors API
  const callAPI = () => {
    // Invert sort order
    let sortField = sortParams.sortField;
    if (sortParams.sortOrder == -1) {
      sortField = "-".concat(sortField);
    }

    VENDORS_API.getVendors({
      page: (pageParams.page ?? 0) + 1,
      page_size: pageParams.rows,
      ordering: sortField,
    }).then((response) => onAPIResponse(response));
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

  // Edit/Delete Cell Template
  const editDeleteCellTemplate = (rowData: Vendor) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success mr-2"
          onClick={() => editVendor(rowData)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger"
          onClick={() => deleteVendorPopup(rowData)}
          disabled={rowData.numPO > 0}
        />
      </React.Fragment>
    );
  };

  // The delete popup
  const deletePopup = (
    <DeletePopup
      deleteItemIdentifier={selectedDeleteVendor.name}
      onConfirm={() => deleteVendorFinal()}
      setIsVisible={setDeletePopupVisible}
    />
  );

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

  // Map column objects to actual columns
  const dynamicColumns = COLUMNS.map((col) => {
    return (
      <Column
        // Indexing/header
        key={col.field}
        field={col.field}
        header={col.header}
        // Filtering
        filter={col.filterable}
        filterElement={col.customFilter}
        //filterMatchMode={"contains"}
        filterPlaceholder={col.filterPlaceholder}
        // Sorting
        sortable
        //sortField={col.field}
        // Hiding Fields
        showFilterMenuOptions={false}
        showClearButton={false}
        // Other
        style={{ minWidth: "16rem" }}
        hidden={col.hidden}
      />
    );
  });

  return (
    <div className="card pt-5 px-2">
      <Toast ref={toast} />
      <DataTable
        // General Settings
        showGridlines
        value={vendors}
        lazy
        responsiveLayout="scroll"
        filterDisplay="row"
        loading={loading}
        // Paginator
        paginator
        first={pageParams.first}
        rows={NUM_ROWS}
        totalRecords={numberOfVendors}
        paginatorTemplate="PrevPageLink NextPageLink"
        onPage={onPage}
        // Sorting
        onSort={onSort}
        sortField={sortParams.sortField}
        sortOrder={sortParams.sortOrder}
        // Filtering
        onFilter={onFilter}
        filters={filterParams.filters}
      >
        {dynamicColumns}
        <Column body={editDeleteCellTemplate} style={{ minWidth: "16rem" }} />
      </DataTable>
      {deletePopupVisible && deletePopup}
    </div>
  );
}
