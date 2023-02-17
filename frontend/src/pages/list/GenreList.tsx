import { Button } from "primereact/button";
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
} from "../../apis/Conversions";
import { GENRES_API, GetGenresResp } from "../../apis/GenresAPI";
import DeletePopup from "../../components/DeletePopup";
import { createColumns, TableColumn } from "../../components/TableColumns";
import EditDeleteTemplate from "../../util/EditDeleteTemplate";
import { logger } from "../../util/Logger";
import { GenreDetailState } from "../detail/GenreDetail";
import { NUM_ROWS } from "./BookList";

// The Genre interface
export interface Genre {
  id: number;
  name: string;
  bookCount: number;
}

// Properties of each column that change, the rest are set below when creating the actual Columns to be rendered
const COLUMNS: TableColumn[] = [
  {
    field: "name",
    header: "Genre",
    sortable: true,
  },
  {
    field: "bookCount",
    header: "Number of Books",
    sortable: true,
  },
];

// Empty genre, used to initialize state
const emptyGenre: Genre = {
  name: "",
  bookCount: 0,
  id: 0,
};

export default function GenreList() {
  // ----------------- STATE -----------------
  const [loading, setLoading] = useState<boolean>(false); // Whether we show that the table is loading or not
  const [numberOfGenres, setNumberOfGenres] = useState<number>(0); // The number of elements that match the query
  const [genres, setGenres] = useState<Genre[]>([]); // The data displayed in the table
  const [deletePopupVisible, setDeletePopupVisible] = useState<boolean>(false); // Whether the delete popup is shown
  const [selectedDeleteGenre, setSelectedDeleteGenre] =
    useState<Genre>(emptyGenre); // The element that has been clicked on to delete

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

  // ----------------- METHODS -----------------
  // Navigator used to go to a different page
  const navigate = useNavigate();

  // Callback functions for edit/delete buttons
  const editGenre = (genre: Genre) => {
    logger.debug("Edit Genre Clicked", genre);
    const detailState: GenreDetailState = {
      id: genre.id,
      genre: genre.name,
      isModifiable: true,
      isConfirmationPopupVisible: false,
    };

    navigate("/genres/detail", { state: detailState });
  };

  // Called to make delete pop up show
  const deleteGenrePopup = (genre: Genre) => {
    logger.debug("Delete Genre Clicked", genre);
    setSelectedDeleteGenre(genre);
    setDeletePopupVisible(true);
  };

  // Call to actually delete the element
  const deleteGenreFinal = () => {
    logger.debug("Delete Genre Finalized", selectedDeleteGenre);
    setDeletePopupVisible(false);
    GENRES_API.deleteGenre({ id: selectedDeleteGenre.id })
      .then(() => showSuccess())
      .catch(() => {
        showFailure();
        return;
      });
    const _genres = genres.filter(
      (selectGenre) => selectedDeleteGenre.id != selectGenre.id
    );
    setGenres(_genres);
    setSelectedDeleteGenre(emptyGenre);
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

  const onRowClick = (event: DataTableRowClickEvent) => {
    // I couldn't figure out a better way to do this...
    // It takes the current index as the table knows it and calculates the actual index in the genres array
    const index = event.index - NUM_ROWS * (pageParams.page ?? 0);
    const genre = genres[index];
    logger.debug("Genre Row Clicked", genre);
    navigate("/books", { state: { genre: genre.name } });
  };

  // API call on page load
  useEffect(() => callAPI(), [sortParams, pageParams]);

  // Calls the Genres API
  const callAPI = () => {
    // Invert sort order
    let sortField = APIGenreSortFieldMap.get(sortParams.sortField) ?? "";
    if (sortParams.sortOrder == -1) {
      sortField = "-".concat(sortField);
    }

    GENRES_API.getGenres({
      page: (pageParams.page ?? 0) + 1,
      page_size: pageParams.rows,
      ordering: sortField,
    }).then((response) => onAPIResponse(response));
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

  // Whether the delete button should be disabled
  const isDeleteDisabled = (genre: Genre) => {
    return genre.bookCount > 0;
  };

  // Edit/Delete Cell Template
  const editDeleteCellTemplate = EditDeleteTemplate<Genre>({
    onEdit: (rowData) => editGenre(rowData),
    onDelete: (rowData) => deleteGenrePopup(rowData),
    deleteDisabled: (rowData) => isDeleteDisabled(rowData),
  });

  // The delete popup
  const deletePopup = (
    <DeletePopup
      deleteItemIdentifier={selectedDeleteGenre.name}
      onConfirm={() => deleteGenreFinal()}
      setIsVisible={setDeletePopupVisible}
    />
  );

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  const showSuccess = () => {
    toast.current?.show({ severity: "success", summary: "Genre deleted" });
  };

  const showFailure = () => {
    toast.current?.show({
      severity: "error",
      summary: "Genre could not be deleted",
    });
  };

  const columns = createColumns(COLUMNS);

  return (
    <div className="card pt-5 px-2">
      <Toast ref={toast} />
      <DataTable
        showGridlines
        // General Settings
        value={genres}
        lazy
        responsiveLayout="scroll"
        loading={loading}
        // Operations on rows
        rowHover
        selectionMode={"single"}
        onRowClick={(event) => onRowClick(event)}
        // Paginator
        paginator
        first={pageParams.first}
        rows={NUM_ROWS}
        totalRecords={numberOfGenres}
        paginatorTemplate="PrevPageLink NextPageLink"
        onPage={onPage}
        // Sorting
        onSort={onSort}
        sortField={sortParams.sortField}
        sortOrder={sortParams.sortOrder}
      >
        {columns}
        <Column
          body={(rowData) => editDeleteCellTemplate(rowData)}
          style={{ minWidth: "16rem" }}
        />
      </DataTable>
      {deletePopupVisible && deletePopup}
    </div>
  );
}
