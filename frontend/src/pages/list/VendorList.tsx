import { Column } from "primereact/column";
import {
  DataTable,
  DataTableFilterEvent,
  DataTableFilterMetaData,
  DataTablePageEvent,
  DataTableSortEvent,
} from "primereact/datatable";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GetVendorsResp, VENDORS_API } from "../../apis/VendorsAPI";
import DeletePopup from "../../components/DeletePopup";
import { TableColumn } from "../../components/Table";
import EditDeleteTemplate from "../../util/EditDeleteTemplate";
import { logger } from "../../util/Logger";
import { VendorDetailState } from "../detail/VendorDetail";
import { NUM_ROWS } from "./BookList";

// The Vendor Interface
export interface Vendor {
  id: number;
  name: string;
}

// Properties of each column that change, the rest are set below when creating the actual Columns to be rendered
const COLUMNS: TableColumn[] = [
  {
    field: "name",
    header: "Vendor Name",
    filterPlaceholder: "Search by Name",
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
};

export default function VendorList() {
  // ----------------- STATE -----------------
  const [loading, setLoading] = useState(false); // Whether we show that the table is loading or not
  const [numberOfVendors, setNumberOfVendors] = useState(0); // The number of elements that match the query
  const [vendors, setVendors] = useState<Vendor[]>([]); // The data displayed in the table
  const [deletePopupVisible, setDeletePopupVisible] = useState(false); // Whether the delete popup is shown
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
      vendor: vendor.name,
      isModifiable: false,
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
    setSelectedDeleteVendor(emptyVendor);
  };

  // Called when any of the filters (search boxes) are typed into
  const onFilter = (event: DataTableFilterEvent) => {
    logger.debug("Filter Applied", event);
    setLoading(true);
    setFilterParams(event);
    callAPI();
  };

  // Called when any of the columns are selected to be sorted
  const onSort = (event: DataTableSortEvent) => {
    logger.debug("Sort Applied", event);
    setLoading(true);
    setSortParams(event);
    callAPI();
  };

  // Called when the paginator page is switched
  const onPage = (event: DataTablePageEvent) => {
    logger.debug("Page Applied", event);
    setLoading(true);
    setPageParams(event);
    callAPI();
  };

  // When any of the list of params are changed, useEffect is called to hit the API endpoint
  useEffect(() => callAPI(), []);

  // Calls the Vendors API
  const callAPI = () => {
    VENDORS_API.getVendors({
      page: pageParams.page ?? 0,
      page_size: pageParams.rows,
      ordering_field: sortParams.sortField,
      ordering_ascending: sortParams.sortOrder,
      search: filterParams.filters.name.value,
    }).then((response) => onAPIResponse(response));
  };

  // Set state when response to API call is received
  const onAPIResponse = (response: GetVendorsResp) => {
    setVendors(response.vendors);
    setNumberOfVendors(response.numberOfVendors);
    setLoading(false);
  };

  // ----------------- TEMPLATES/VISIBLE COMPONENTS -----------------

  // Edit/Delete Cell Template
  const editDeleteCellTemplate = EditDeleteTemplate<Vendor>({
    onEdit: (rowData) => editVendor(rowData),
    onDelete: (rowData) => deleteVendorPopup(rowData),
  });

  // The delete popup
  const deletePopup = (
    <DeletePopup
      deleteItemIdentifier={selectedDeleteVendor.name}
      onConfirm={() => deleteVendorFinal()}
      setIsVisible={setDeletePopupVisible}
    />
  );

  // Map column objects to actual columns
  const dynamicColumns = COLUMNS.map((col) => {
    return (
      <Column
        // Indexing/header
        key={col.field}
        field={col.field}
        header={col.header}
        // Filtering
        filter
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
    <>
      <DataTable
        // General Settings
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
    </>
  );
}
