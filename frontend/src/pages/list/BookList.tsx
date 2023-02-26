import { APIBook, BOOKS_API, GetBooksResp } from "../../apis/BooksAPI";
import {
  DataTable,
  DataTableFilterEvent,
  DataTablePageEvent,
  DataTableRowClickEvent,
  DataTableSortEvent,
} from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import { useEffect, useRef, useState } from "react";
import { DataTableFilterMetaData } from "primereact/datatable";
import DeletePopup from "../../components/popups/DeletePopup";
import { logger } from "../../util/Logger";
import { useLocation, useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
import {
  APIBookSortFieldMap,
  APIToInternalBookConversion,
} from "../../apis/Conversions";
import { createColumns, TableColumn } from "../../components/TableColumns";
import {
  priceBodyTemplate,
  imageBodyTemplate,
} from "../../util/TableCellEditFuncs";
import EditDeleteTemplate from "../../util/EditDeleteTemplate";
import GenreDropdown from "../../components/dropdowns/GenreDropdown";
import { InputSwitch } from "primereact/inputswitch";

export const NUM_ROWS = 10;

export interface Book {
  id: string;
  title: string;
  author: string;
  genres: string;
  isbn13: number;
  isbn10: number;
  publisher: string;
  publishedYear: number;
  pageCount: number;
  width: number;
  height: number;
  thickness: number;
  retailPrice: number;
  stock: number;
  thumbnailURL: string;
  imageFile?: File;
  isImageUpload?: boolean;
  isImageDelete?: boolean;
}

interface Filters {
  [title: string]: DataTableFilterMetaData;
  author: DataTableFilterMetaData;
  isbn13: DataTableFilterMetaData;
  publisher: DataTableFilterMetaData;
}

// Used for initializing state
export const emptyBook: Book = {
  id: "0",
  title: "",
  author: "",
  genres: "",
  isbn13: 0,
  isbn10: 0,
  publisher: "",
  publishedYear: 0,
  pageCount: 0,
  width: 0,
  height: 0,
  thickness: 0,
  retailPrice: 0,
  stock: 0,
  thumbnailURL: "",
};

export default function BookList() {
  // ----- STATE -----
  const location = useLocation(); // Utilized if coming from the genre list
  const [deletePopupVisible, setDeletePopupVisible] = useState<boolean>(false); // Whether the delete popup is visible
  const [loading, setLoading] = useState<boolean>(false); // Whether we show that the table is loading or not
  const [numberOfBooks, setNumberOfBooks] = useState<number>(0); // The number of books that match the query
  const [books, setBooks] = useState<Book[]>([]); // The book data itself (rows of the table)
  const [selectedGenre, setSelectedGenre] = useState<string>(
    location.state?.genre ?? ""
  ); // Initialize genre to the genre passed, if coming from genre list
  const [selectedDeleteBook, setSelectedDeleteBook] = useState<Book>(emptyBook); // track the current book that has been selected to be deleted
  const [rows, setRows] = useState<number>(NUM_ROWS);
  const [isNoPagination, setIsNoPagination] = useState<boolean>(false);

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
  const [filterParams, setFilterParams] = useState<DataTableFilterEvent>({
    filters: {
      title: { value: "", matchMode: "contains" },
      author: { value: "", matchMode: "contains" },
      isbn13: { value: "", matchMode: "contains" },
      publisher: { value: "", matchMode: "contains" },
    } as Filters,
  });

  // Custom dropdown selector for genre
  const genreFilter = (
    <GenreDropdown
      selectedGenre={selectedGenre}
      setSelectedGenre={setSelectedGenre}
    />
  );

  const COLUMNS: TableColumn[] = [
    {
      field: "thumbnailURL",
      header: "Cover Art",
      customBody: (rowData: Book) => imageBodyTemplate(rowData.thumbnailURL),
      style: { minWidth: "9rem" },
    },
    {
      field: "title",
      header: "Title",
      filterPlaceholder: "Search by Title",
      sortable: true,
      filterable: true,
    },
    {
      field: "author",
      header: "Authors",
      filterPlaceholder: "Search by Authors",
      sortable: true,
      filterable: true,
    },
    {
      field: "genres",
      header: "Genre",
      filterPlaceholder: "Search by Genre",
      filterable: true,
      sortable: true,
      customFilter: genreFilter,
    },
    {
      field: "isbn13",
      header: "ISBN 13",
      filterPlaceholder: "Search by ISBN",
      sortable: true,
      filterable: true,
    },
    {
      field: "isbn10",
      header: "ISBN 10",
      filterPlaceholder: "Search by ISBN",
      sortable: true,
      filterable: false,
    },
    {
      field: "publisher",
      header: "Publisher",
      filterPlaceholder: "Search by Publisher",
      sortable: true,
      filterable: true,
    },
    {
      field: "retailPrice",
      header: "Retail Price ($)",
      sortable: true,
      customBody: (rowData: Book) => priceBodyTemplate(rowData.retailPrice),
    },
    {
      field: "stock",
      header: "Inventory Count",
      sortable: true,
    },
  ];

  // The navigator to switch pages
  const navigate = useNavigate();

  // Checks if the book can be deleted
  const isDeleteDisabled = (book: Book) => {
    return book.stock > 0;
  };

  // Edit/Delete Cell Template
  const editDeleteCellTemplate = EditDeleteTemplate<Book>({
    onEdit: (rowData) => toDetailsPage(rowData),
    onDelete: (rowData) => deleteBookPopup(rowData),
    deleteDisabled: (rowData) => isDeleteDisabled(rowData),
  });

  // Callback functions for edit/delete buttons
  const toDetailsPage = (book: Book) => {
    logger.debug("Edit Book Clicked", book);
    navigate(`/books/detail/${book.id}`);
  };

  const deleteBookPopup = (book: Book) => {
    logger.debug("Delete Book Clicked", book);
    setSelectedDeleteBook(book);
    setDeletePopupVisible(true);
  };

  const deleteBookFinal = () => {
    logger.debug("Delete Book Finalized", selectedDeleteBook);
    setDeletePopupVisible(false);
    BOOKS_API.deleteBook({ id: selectedDeleteBook.id })
      .then(() => {
        showSuccess();
      })
      .catch(() => {
        showFailure();
        return;
      });
    // TODO: Show error if book is not actually deleted
    const _books = books.filter((book) => selectedDeleteBook.id != book.id);
    setBooks(_books);
    setSelectedDeleteBook(emptyBook);
  };

  const deletePopup = (
    <DeletePopup
      deleteItemIdentifier={selectedDeleteBook.title}
      onConfirm={() => deleteBookFinal()}
      setIsVisible={setDeletePopupVisible}
    />
  );

  // Calls the Books API
  const callAPI = () => {
    // Only search by one of the search boxes
    let search_string = "";
    let title_only = false;
    let publisher_only = false;
    let author_only = false;
    let isbn_only = false;
    if (
      "value" in filterParams.filters.title &&
      filterParams.filters.title.value
    ) {
      search_string = filterParams.filters.title.value;
      title_only = true;
    } else if (
      "value" in filterParams.filters.publisher &&
      filterParams.filters.publisher.value
    ) {
      search_string = filterParams.filters.publisher.value;
      publisher_only = true;
    } else if (
      "value" in filterParams.filters.author &&
      filterParams.filters.author.value
    ) {
      search_string = filterParams.filters.author.value;
      author_only = true;
    } else if (
      "value" in filterParams.filters.isbn13 &&
      filterParams.filters.isbn13.value
    ) {
      search_string = filterParams.filters.isbn13.value ?? "";
      isbn_only = true;
    }

    // Invert sort order
    let sortField = APIBookSortFieldMap.get(sortParams.sortField) ?? "";
    if (sortParams.sortOrder == -1) {
      sortField = "-".concat(sortField);
    }

    if (isNoPagination) {
      BOOKS_API.getBooksNoPaginationFiltered({
        no_pagination: true,
        ordering: sortField,
        genre: selectedGenre,
        search: search_string,
        title_only: title_only,
        publisher_only: publisher_only,
        author_only: author_only,
        isbn_only: isbn_only,
      }).then((response) => onAPIResponseNoPage(response));
    } else {
      BOOKS_API.getBooks({
        page: (pageParams.page ?? 0) + 1,
        page_size: pageParams.rows,
        ordering: sortField,
        genre: selectedGenre,
        search: search_string,
        title_only: title_only,
        publisher_only: publisher_only,
        author_only: author_only,
        isbn_only: isbn_only,
      }).then((response) => onAPIResponse(response));
    }
  };

  // Set state when response to API call is received
  const onAPIResponse = (response: GetBooksResp) => {
    setBooks(response.results.map((book) => APIToInternalBookConversion(book)));
    setNumberOfBooks(response.count);
    setLoading(false);
  };

  // Set state when response to API call is received
  const onAPIResponseNoPage = (response: APIBook[]) => {
    setBooks(response.map((book) => APIToInternalBookConversion(book)));
    setLoading(false);
  };

  // Called when any of the filters (search boxes) are typed into
  const onFilter = (event: DataTableFilterEvent) => {
    logger.debug("Filter Applied", event);
    setLoading(true);
    setPageParams({
      first: 0,
      rows: NUM_ROWS,
      page: 0,
    });
    setFilterParams(event);
  };

  // Called when any of the columns are selected to be sorted
  const onSort = (event: DataTableSortEvent) => {
    logger.debug("Sort Applied", event);
    setLoading(true);
    setSortParams(event);
    console.log(sortParams.sortOrder);
  };

  // Called when the paginator page is switched
  const onPage = (event: DataTablePageEvent) => {
    logger.debug("Page Applied", event);
    setRows(event.rows);
    setLoading(true);
    setPageParams(event);
  };

  const onRowClick = (event: DataTableRowClickEvent) => {
    // I couldn't figure out a better way to do this...
    // It takes the current index as the table knows it and calculates the actual index in the books array
    const index = event.index - NUM_ROWS * (pageParams.page ?? 0);
    const book = books[index];
    logger.debug("Book Row Clicked", book);
    toDetailsPage(book);
  };

  // Call endpoint on page load whenever any of these variables change
  useEffect(() => {
    callAPI();
  }, [sortParams, pageParams, filterParams, selectedGenre, isNoPagination]);

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  const showSuccess = () => {
    toast.current?.show({ severity: "success", summary: "Book deleted" });
  };

  const showFailure = () => {
    toast.current?.show({
      severity: "error",
      summary: "Book could not be modified",
    });
  };

  const columns = createColumns(COLUMNS);

  return (
    <div className="card pt-5 px-2">
      <Toast ref={toast} />
      <DataTable
        // General Settings
        showGridlines
        value={books}
        lazy
        responsiveLayout="scroll"
        filterDisplay="row"
        loading={loading}
        // Row clicking
        rowHover
        selectionMode={"single"}
        onRowClick={(event) => onRowClick(event)}
        // Paginator
        paginator={!isNoPagination}
        first={pageParams.first}
        rows={rows}
        totalRecords={numberOfBooks}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        onPage={onPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        paginatorPosition="both"
        // Sorting
        onSort={onSort}
        sortField={sortParams.sortField}
        sortOrder={sortParams.sortOrder}
        // Filtering
        onFilter={onFilter}
        filters={filterParams.filters}
      >
        {columns}
        <Column body={editDeleteCellTemplate} style={{ minWidth: "9rem" }} />
      </DataTable>
      {deletePopupVisible && deletePopup}
      <div className="flex col-2 p-0">
        <label
          className="p-component p-text-secondary text-teal-900 my-auto mr-2"
          htmlFor="retail_price"
        >
          No Pagination
        </label>
        <InputSwitch
          checked={isNoPagination}
          id="modifyBookToggle"
          name="modifyBookToggle"
          onChange={() => setIsNoPagination(!isNoPagination)}
          className="my-auto "
        />
      </div>
    </div>
  );
}
