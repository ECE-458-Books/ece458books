import {
  DataTable,
  DataTableFilterEvent,
  DataTableFilterMeta,
  DataTablePageEvent,
  DataTableRowClickEvent,
  DataTableSortEvent,
} from "primereact/datatable";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SelectSizeButtonOptions } from "../../components/buttons/SelectSizeButton";
import {
  createColumns,
  TableColumn,
} from "../../components/datatable/TableColumns";
import { NUM_ROWS } from "../../pages/books/BookList";
import { IDer } from "../../util/IDOps";
import { logger } from "../../util/Logger";

interface ListTemplateProps<T extends IDer> {
  columns: TableColumn[]; // The columns of the table
  detailPageURL: string; // The URL of the detail page
  whitespaceSize: SelectSizeButtonOptions; // Whitespace size between table rows
  isNoPagination: boolean; // Whether pagination is currently enabled
  isLoading: boolean; // Whether the table is currently loading data
  setIsLoading: (isLoading: boolean) => void;
  totalNumberOfEntries: number; // Number of total entries that can be in the table
  setTotalNumberOfEntries: (numberOfRows: number) => void;
  rows: T[]; // The actual data in the rows of the table
  APISortFieldMap: Map<string, string>; // Mapping for the sort field for API calls
  callGetAPI: (page: number, pageSize: number, sortField: string) => void; // The API to call when table params are altered
  onFilter?: (event: DataTableFilterEvent) => void; // The function to call when a filter is applied
  filters?: DataTableFilterMeta;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additionalAPITriggers?: any[]; // Any other variables that should trigger the API call
}

export const STARTING_SORT_PARAMS: DataTableSortEvent = {
  sortField: "",
  sortOrder: null,
  multiSortMeta: null, // Not used
};

export const STARTING_PAGE_PARAMS: DataTablePageEvent = {
  first: 0,
  rows: NUM_ROWS,
  page: 0,
};

export function invertSortFieldIfNecessary(
  sortParams: DataTableSortEvent,
  sortField: string
) {
  if (sortParams.sortOrder == -1) {
    sortField = "-".concat(sortField);
  }
  return sortField;
}

export default function ListTemplate<T extends IDer>(
  props: ListTemplateProps<T>
) {
  // ----------------- STATE -----------------
  const navigate = useNavigate();
  const [numCurrentlyDisplayedRows, setNumCurrentlyDisplayedRows] =
    useState<number>(NUM_ROWS);
  const [sortParams, setSortParams] =
    useState<DataTableSortEvent>(STARTING_SORT_PARAMS);
  const [pageParams, setPageParams] =
    useState<DataTablePageEvent>(STARTING_PAGE_PARAMS);

  // ----------------- FUNCTIONS -----------------

  // Called when any of the columns are selected to be sorted
  const onSort = (event: DataTableSortEvent) => {
    logger.debug("Sort Applied", event);
    props.setIsLoading(true);
    setSortParams(event);
  };

  // Called when the paginator page is switched
  const onPage = (event: DataTablePageEvent) => {
    logger.debug("Page Applied", event);
    setNumCurrentlyDisplayedRows(event.rows);
    props.setIsLoading(true);
    setPageParams(event);
  };

  const onRowClick = (event: DataTableRowClickEvent) => {
    const row = event.data as T;
    logger.debug("Row Clicked", row);
    navigate(`${props.detailPageURL}${row.id}`);
  };

  // When any of the list of params are changed, useEffect is called to hit the API endpoint
  useEffect(() => {
    let sortField = props.APISortFieldMap.get(sortParams.sortField) ?? "";
    sortField = invertSortFieldIfNecessary(sortParams, sortField);
    props.callGetAPI((pageParams.page ?? 0) + 1, pageParams.rows, sortField);
  }, [
    sortParams,
    pageParams,
    props.isNoPagination,
    props.additionalAPITriggers,
  ]);

  // ----------------- VISUAL ELEMENTS -----------------

  const columns = createColumns(props.columns);

  return (
    <DataTable
      // General Settings
      showGridlines
      value={props.rows}
      lazy
      responsiveLayout="scroll"
      filterDisplay={"row"}
      loading={props.isLoading}
      size={props.whitespaceSize}
      // Row clicking
      rowHover
      selectionMode={"single"}
      onRowClick={(event) => onRowClick(event)}
      // Paginator
      paginator={!props.isNoPagination}
      first={pageParams.first}
      rows={numCurrentlyDisplayedRows}
      totalRecords={props.totalNumberOfEntries}
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      onPage={onPage}
      rowsPerPageOptions={[5, 10, 15, 25, 50]}
      paginatorPosition="both"
      // Sorting
      onSort={onSort}
      sortField={sortParams.sortField}
      sortOrder={sortParams.sortOrder}
      // Filtering
      onFilter={props.onFilter}
      filters={props.filters}
    >
      {columns}
    </DataTable>
  );
}
