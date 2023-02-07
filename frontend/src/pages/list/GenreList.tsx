import { Button } from "primereact/button";
import { Column } from "primereact/column";
import {
  DataTable,
  DataTableFilterEvent,
  DataTableFilterMetaData,
  DataTablePageEvent,
  DataTableSortEvent,
} from "primereact/datatable";
import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GENRES_API, GetGenresResp } from "../../apis/GenresAPI";
import DeletePopup from "../../components/DeletePopup";
import { TableColumn } from "../../components/Table";
import { logger } from "../../util/Logger";
import { GenreDetailState } from "../detail/GenreDetail";
import { NUM_ROWS } from "./BookList";

// The Genre interface
export interface Genre {
  id: number;
  name: string;
  book_cnt: number;
}

interface GenreRow extends Genre {
  isDeletable: boolean;
}

// Properties of each column that change, the rest are set below when creating the actual Columns to be rendered
const COLUMNS: TableColumn[] = [
  {
    field: "name",
    header: "Genre",
    filterPlaceholder: "Search by Genre",
    filterable: false,
  },
  {
    field: "book_cnt",
    header: "Number of Books",
    filterPlaceholder: "Search by Number of Books",
    filterable: false,
  },
];

// Define the column filters
interface Filters {
  [id: string]: DataTableFilterMetaData;
  name: DataTableFilterMetaData;
  book_cnt: DataTableFilterMetaData;
}

// Empty genre, used to initialize state
const emptyGenre = {
  name: "",
  book_cnt: 0,
  id: 0,
};

export default function GenreList() {
  // ----------------- STATE -----------------
  const [loading, setLoading] = useState(false); // Whether we show that the table is loading or not
  const [numberOfGenres, setNumberOfGenres] = useState(0); // The number of elements that match the query
  const [genres, setGenres] = useState<Genre[]>([]); // The data displayed in the table
  const [deletePopupVisible, setDeletePopupVisible] = useState(false); // Whether the delete popup is shown
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

  // The current state of the filters
  const [filterParams, setFilterParams] = useState<any>({
    filters: {
      id: { value: "", matchMode: "contains" },
      name: { value: "", matchMode: "contains" },
      book_cnt: { value: "", matchMode: "contains" },
    } as Filters,
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
      isModifiable: false,
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
    GENRES_API.deleteGenre(selectedDeleteGenre.id);
    const _genres = genres.filter(
      (selectGenre) => selectedDeleteGenre.id != selectGenre.id
    );
    setGenres(_genres);
    setDeletePopupVisible(false);
    setSelectedDeleteGenre(emptyGenre);
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

  // API call on page load
  useEffect(() => callAPI(), [sortParams, pageParams, filterParams]);

  // Calls the Genres API
  const callAPI = () => {
    // Invert sort order
    let sortField = sortParams.sortField;
    if (sortParams.sortOrder == -1) {
      sortField = "-".concat(sortField);
    }

    GENRES_API.getGenres({
      page: pageParams.page ?? 0,
      page_size: pageParams.rows,
      ordering: sortField,
    }).then((response) => onAPIResponse(response));
  };

  // Set state when response to API call is received
  const onAPIResponse = (response: GetGenresResp) => {
    setGenres(response.genres);
    setNumberOfGenres(response.numberOfGenres);
    setLoading(false);
  };

  // ----------------- TEMPLATES/VISIBLE COMPONENTS -----------------

  // Edit/Delete Cell Template
  const editDeleteCellTemplate = (rowData: Genre) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success mr-2"
          onClick={() => editGenre(rowData)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger"
          onClick={() => deleteGenrePopup(rowData)}
          disabled={rowData.book_cnt > 0}
        />
      </React.Fragment>
    );
  };

  // The delete popup
  const deletePopup = (
    <DeletePopup
      deleteItemIdentifier={selectedDeleteGenre.name}
      onConfirm={() => deleteGenreFinal()}
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
    <>
      <DataTable
        // General Settings
        value={genres}
        lazy
        responsiveLayout="scroll"
        filterDisplay="row"
        loading={loading}
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
        // Filtering
        onFilter={onFilter}
        filters={filterParams.filters}
      >
        {dynamicColumns}
        <Column
          body={(rowData) => editDeleteCellTemplate(rowData)}
          style={{ minWidth: "16rem" }}
        />
      </DataTable>
      {deletePopupVisible && deletePopup}
    </>
  );
}
