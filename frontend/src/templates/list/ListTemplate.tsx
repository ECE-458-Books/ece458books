import {
  DataTable,
  DataTableFilterEvent,
  DataTableFilterMeta,
  DataTablePageEvent,
  DataTableRowClickEvent,
  DataTableSortEvent,
} from "primereact/datatable";
import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createColumns,
  TableColumn,
} from "../../components/datatable/TableColumns";
import { isHighlightingText } from "../../util/ClickCheck";
import { IDer } from "../../util/IDOps";
import { logger } from "../../util/Logger";
import { SelectSizeDropdownOptions } from "../../components/dropdowns/SelectSizeDropdown";
import { Dropdown } from "primereact/dropdown";
import { PaginatorRowsPerPageDropdownOptions } from "primereact/paginator";
import { scrollToTop } from "../../util/WindowViewportOps";

interface ListTemplateProps<T extends IDer> {
  columns: TableColumn<T>[]; // The columns of the table
  detailPageURL: string; // The URL of the detail page
  whitespaceSize: SelectSizeDropdownOptions; // Whitespace size between table rows
  isNoPagination: boolean; // Whether pagination is currently enabled
  setIsNoPagination: (isNoPagination: boolean) => void;
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
  paginatorLeft?: ReactNode; // React UI components to the left of the paginator on the same horizontal space
  paginatorRight?: ReactNode; // React UI components to the right of the paginator on the same horizontal space
}

export const STARTING_SORT_PARAMS: DataTableSortEvent = {
  sortField: "",
  sortOrder: null,
  multiSortMeta: null, // Not used
};

export const STARTING_PAGE_PARAMS: DataTablePageEvent = {
  first: 0,
  rows: 15,
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
    useState<number>(STARTING_PAGE_PARAMS.rows);
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
    event.rows === props.totalNumberOfEntries
      ? props.setIsNoPagination(true)
      : props.setIsNoPagination(false);
    props.setIsLoading(true);
    setPageParams(event);
  };

  const onFilter = (event: DataTableFilterEvent) => {
    setPageParams({
      first: 0,
      rows: numCurrentlyDisplayedRows,
      page: 0,
    });
    props.onFilter?.(event);
  };

  const onRowClick = (event: DataTableRowClickEvent) => {
    if (isHighlightingText()) return;
    const row = event.data as T;
    logger.debug("Row Clicked", row);
    navigate(`${props.detailPageURL}${row.id}`);
  };

  // When any of the list of params are changed, useEffect is called to hit the API endpoint
  useEffect(() => {
    let sortField = props.APISortFieldMap.get(sortParams.sortField) ?? "";
    sortField = invertSortFieldIfNecessary(sortParams, sortField);
    props.callGetAPI((pageParams.page ?? 0) + 1, pageParams.rows, sortField);
  }, [sortParams, pageParams].concat(props.additionalAPITriggers ?? []));

  //no pagination effect creator
  useEffect(() => {
    if (props.isNoPagination) {
      scrollToTop();
    }
  }, [props.isNoPagination]);

  // ----------------- VISUAL ELEMENTS -----------------

  const columns = createColumns(props.columns);

  const paginatorTemplateCustom = {
    layout:
      "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown",
    RowsPerPageDropdown: (options: PaginatorRowsPerPageDropdownOptions) => {
      const dropdownOptions = [
        { label: 10, value: 10 },
        { label: 15, value: 15 },
        { label: 25, value: 25 },
        { label: 50, value: 50 },
        { label: 75, value: 75 },
        { label: "Show All", value: options.totalRecords },
      ];

      return (
        <Dropdown
          value={options.value}
          options={dropdownOptions}
          onChange={options.onChange}
        />
      );
    },
  };

  return (
    <DataTable
      // General Settings
      showGridlines
      value={props.rows}
      lazy
      responsiveLayout="scroll"
      filterDisplay={props.filters ? "row" : undefined}
      loading={props.isLoading}
      size={props.whitespaceSize}
      // Row clicking
      rowHover
      selectionMode={"single"}
      onRowClick={(event) => onRowClick(event)}
      // Paginator
      paginator
      first={pageParams.first}
      rows={numCurrentlyDisplayedRows}
      totalRecords={props.totalNumberOfEntries}
      paginatorTemplate={paginatorTemplateCustom}
      onPage={onPage}
      paginatorPosition="both"
      paginatorLeft={props.paginatorLeft}
      paginatorRight={props.paginatorRight}
      // Sorting
      onSort={onSort}
      sortField={sortParams.sortField}
      sortOrder={sortParams.sortOrder}
      // Filtering
      onFilter={onFilter}
      filters={props.filters}
    >
      {columns}
    </DataTable>
  );
}
