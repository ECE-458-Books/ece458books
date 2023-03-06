import { Column } from "primereact/column";
import {
  DataTable,
  DataTablePageEvent,
  DataTableRowClickEvent,
  DataTableSortEvent,
} from "primereact/datatable";
import { Toast } from "primereact/toast";
import React, { useRef } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  APIGenreSortFieldMap,
  APIToInternalGenreConversion,
} from "../../apis/genres/GenresConversions";
import {
  APIGenre,
  GENRES_API,
  GetGenresResp,
} from "../../apis/genres/GenresAPI";
import {
  createColumns,
  TableColumn,
} from "../../components/datatable/TableColumns";
import { logger } from "../../util/Logger";
import { NUM_ROWS } from "../books/BookList";
import AddPageButton from "../../components/buttons/AddPageButton";
import LabeledSwitch from "../../components/buttons/LabeledSwitch";
import SelectSizeButton, {
  SelectSizeButtonOptions,
} from "../../components/buttons/SelectSizeButton";
import { Button } from "primereact/button";
import { isHighlightingText } from "../../util/ClickCheck";

// The Genre interface
export interface Genre {
  id: string;
  name: string;
  bookCount: number;
}

// Properties of each column that change, the rest are set below when creating the actual Columns to be rendered
const COLUMNS: TableColumn[] = [
  {
    field: "name",
    header: "Genre",
    sortable: true,
    style: { minWidth: "8rem", width: "16rem" },
  },
  {
    field: "bookCount",
    header: "Number of Books",
    sortable: true,
    style: { minWidth: "8rem", width: "12rem" },
  },
];

export default function GenreList() {
  // ----------------- STATE -----------------
  const [loading, setLoading] = useState<boolean>(false); // Whether we show that the table is loading or not
  const [numberOfGenres, setNumberOfGenres] = useState<number>(0); // The number of elements that match the query
  const [genres, setGenres] = useState<Genre[]>([]); // The data displayed in the table

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
  // Navigator used to go to a different page
  const navigate = useNavigate();

  // Callback functions for edit/delete buttons
  const goToFilteredBookList = (genre: Genre) => {
    logger.debug("Genre Row Clicked", genre);
    navigate("/books", { state: { genre: genre.name } });
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

  const onRowClick = (event: DataTableRowClickEvent) => {
    if (isHighlightingText()) return;
    const genre = event.data as Genre;
    logger.debug("Edit Genre Clicked", genre);
    navigate(`/genres/detail/${genre.id}`);
  };

  // API call on page load
  useEffect(() => callAPI(), [sortParams, pageParams, isNoPagination]);

  // Calls the Genres API
  const callAPI = () => {
    // Invert sort order
    let sortField = APIGenreSortFieldMap.get(sortParams.sortField) ?? "";
    if (sortParams.sortOrder == -1) {
      sortField = "-".concat(sortField);
    }

    if (!isNoPagination) {
      GENRES_API.getGenres({
        page: (pageParams.page ?? 0) + 1,
        page_size: pageParams.rows,
        ordering: sortField,
      }).then((response) => onAPIResponse(response));
    } else {
      GENRES_API.getGenresNoPaginationLISTVIEW({
        no_pagination: true,
        ordering: sortField,
      }).then((response) => onAPIResponseNoPagination(response));
    }
  };

  const onAPIResponseNoPagination = (response: APIGenre[]) => {
    setGenres(response.map((genre) => APIToInternalGenreConversion(genre)));
    setNumberOfGenres(response.length);
    setLoading(false);
  };

  // Set state when response to API call is received
  const onAPIResponse = (response: GetGenresResp) => {
    setGenres(
      response.results.map((genre) => APIToInternalGenreConversion(genre))
    );
    setNumberOfGenres(response.count);
    setLoading(false);
  };

  // ----------------- TEMPLATES/VISIBLE COMPONENTS -----------------

  const bookFilteredList = (rowData: Genre) => {
    return (
      <React.Fragment>
        <div className="flex justify-content-center">
          <Button
            icon="pi pi-align-justify"
            className="p-button-rounded p-button-info"
            style={{ height: 40, width: 40 }}
            onClick={() => goToFilteredBookList(rowData)}
          />
        </div>
      </React.Fragment>
    );
  };

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  const columns = createColumns(COLUMNS);

  const addGenreButton = (
    <div className="flex justify-content-end col-3">
      <AddPageButton
        onClick={() => navigate("/genres/add")}
        label="Add Genre"
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
        {addGenreButton}
      </div>
      <div className="flex justify-content-center">
        <div className="card col-8 pt-0 px-3 justify-content-center">
          <Toast ref={toast} />
          <DataTable
            showGridlines
            // General Settings
            value={genres}
            lazy
            responsiveLayout="scroll"
            loading={loading}
            size={size ?? "small"}
            // Operations on rows
            rowHover
            selectionMode={"single"}
            onRowClick={(event) => onRowClick(event)}
            // Paginator
            paginator={!isNoPagination}
            first={pageParams.first}
            rows={rows}
            totalRecords={numberOfGenres}
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
              body={bookFilteredList}
              style={{ width: "3rem", padding: 2 }}
            />
          </DataTable>
        </div>
      </div>
    </div>
  );
}