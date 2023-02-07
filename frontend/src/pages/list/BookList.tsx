import { Dropdown } from "primereact/dropdown";
import { BOOKS_API, GetBooksResp } from "../../apis/BooksAPI";
import {
  DataTable,
  DataTableFilterEvent,
  DataTablePageEvent,
  DataTableSortEvent,
} from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import { useEffect, useState } from "react";
import { DataTableFilterMetaData } from "primereact/datatable";
import { Genre } from "./GenreList";
import DeletePopup from "../../components/DeletePopup";
import EditDeleteTemplate from "../../util/EditDeleteTemplate";
import { logger } from "../../util/Logger";
import { BookDetailState } from "../detail/ModfiyBook";
import { useNavigate } from "react-router-dom";
import { GENRES_API } from "../../apis/GenresAPI";

export const NUM_ROWS = 3;

interface TableColumn {
  field: string;
  header: string;
  filterPlaceholder?: string;
  customFilter?: () => JSX.Element;
  hidden?: boolean;
}

const GENRE_DATA: Genre[] = [
  {
    id: 3,
    genre: "blah",
    numGenres: 5,
  },
];

export interface Book {
  id: number;
  title: string;
  author: string;
  genres: string;
  isbn_13: number;
  isbn10: number;
  publisher: string;
  publishedYear: number;
  pageCount: number;
  width: number;
  height: number;
  thickness: number;
  retailPrice: number;
}

interface Filters {
  [id: string]: DataTableFilterMetaData;
  title: DataTableFilterMetaData;
  author: DataTableFilterMetaData;
  isbn_13: DataTableFilterMetaData;
  isbn10: DataTableFilterMetaData;
  publisher: DataTableFilterMetaData;
  publishedYear: DataTableFilterMetaData;
  pageCount: DataTableFilterMetaData;
  width: DataTableFilterMetaData;
  height: DataTableFilterMetaData;
  thickness: DataTableFilterMetaData;
  retailPrice: DataTableFilterMetaData;
}

export default function BookList() {
  const emptyBook = {
    id: 0,
    title: "",
    author: "",
    genres: "",
    isbn_13: 0,
    isbn10: 0,
    publisher: "",
    publishedYear: 0,
    pageCount: 0,
    width: 0,
    height: 0,
    thickness: 0,
    retailPrice: 0,
  };

  // Custom dropdown selector for Genre
  const [genreList, setGenreList] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>("");

  useEffect(() => {
    GENRES_API.getGenres({
      page: 0,
      page_size: 30,
      ordering_field: undefined,
      ordering_ascending: undefined,
      search: "",
    }).then((response) =>
      setGenreList(response.genres.map((genre) => genre.genre))
    );
  }, []);

  const genreFilter = () => {
    return (
      <Dropdown
        value={selectedGenre}
        options={genreList}
        appendTo={"self"}
        onChange={(e) => setSelectedGenre(e.value)}
        placeholder={"Select Genre"}
        showClear
      />
    );
  };

  // Properties of each column that change, the rest are set below when creating the actual Columns to be rendered
  const COLUMNS: TableColumn[] = [
    { field: "id", header: "ID", filterPlaceholder: "Search by ID" },
    { field: "title", header: "Title", filterPlaceholder: "Search by Title" },
    {
      field: "author",
      header: "Authors",
      filterPlaceholder: "Search by Authors",
    },
    {
      field: "genres",
      header: "Genre",
      filterPlaceholder: "Search by Genre",
      customFilter: genreFilter,
    },
    { field: "isbn_13", header: "ISBN", filterPlaceholder: "Search by ISBN" },
    {
      field: "isbn10",
      header: "ISBN",
      filterPlaceholder: "Search by ISBN",
      hidden: true,
    },
    {
      field: "publisher",
      header: "Publisher",
      filterPlaceholder: "Search by Publisher",
    },
    {
      field: "publishedYear",
      header: "Publication Year",
      filterPlaceholder: "Search by Publication Year",
      hidden: true,
    },
    {
      field: "pageCount",
      header: "Page Count",
      filterPlaceholder: "Search by Page Count",
      hidden: true,
    },
    {
      field: "width",
      header: "Width",
      filterPlaceholder: "Search by Width",
      hidden: true,
    },
    {
      field: "height",
      header: "Height",
      filterPlaceholder: "Search by Height",
      hidden: true,
    },
    {
      field: "thickness",
      header: "Thickness",
      filterPlaceholder: "Search by Thickness",
      hidden: true,
    },
    {
      field: "retailPrice",
      header: "Retail Price",
      filterPlaceholder: "Search by Price",
    },
  ];

  // The navigator to switch pages
  const navigate = useNavigate();

  // State to track the current book that has been selected to be deleted
  const [selectedDeleteBook, setSelectedDeleteBook] = useState<Book>(emptyBook);

  // Custom body template for edit/delete buttons
  const editDeleteCellTemplate = EditDeleteTemplate<Book>({
    onEdit: (rowData) => editBook(rowData),
    onDelete: (rowData) => deleteBookPopup(rowData),
  });

  // Callback functions for edit/delete buttons
  const editBook = (book: Book) => {
    logger.debug("Edit Book Clicked", book);
    const detailState: BookDetailState = {
      book: book,
      isModifiable: false,
      isConfirmationPopupVisible: false,
    };

    navigate("/books/detail", { state: detailState });
  };

  const deleteBookPopup = (book: Book) => {
    logger.debug("Delete Book Clicked", book);
    setSelectedDeleteBook(book);
    setDeletePopupVisible(true);
  };

  const deleteBookFinal = () => {
    logger.debug("Delete Book Finalized", selectedDeleteBook);
    BOOKS_API.deleteBook(selectedDeleteBook.id);
    // TODO: Show error if book is not actually deleted
    const _books = books.filter((book) => selectedDeleteBook.id != book.id);
    setBooks(_books);
    setDeletePopupVisible(false);
    setSelectedDeleteBook(emptyBook);
    console.log(selectedDeleteBook);
  };

  // Buttons for the delete Dialogue Popup
  const [deletePopupVisible, setDeletePopupVisible] = useState(false);

  const deletePopup = (
    <DeletePopup
      deleteItemIdentifier={selectedDeleteBook.title}
      onConfirm={() => deleteBookFinal()}
      setIsVisible={setDeletePopupVisible}
    />
  );

  const [loading, setLoading] = useState(false); // Whether we show that the table is loading or not
  const [numberOfBooks, setNumberOfBooks] = useState(0); // The number of books that match the query
  const [books, setBooks] = useState<Book[]>([]); // The book data itself

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
      title: { value: "", matchMode: "contains" },
      author: { value: "", matchMode: "contains" },
      isbn_13: { value: "", matchMode: "contains" },
      isbn10: { value: "", matchMode: "contains" },
      publisher: { value: "", matchMode: "contains" },
      publishedYear: { value: "", matchMode: "contains" },
      pageCount: { value: "", matchMode: "contains" },
      width: { value: "", matchMode: "contains" },
      height: { value: "", matchMode: "contains" },
      thickness: { value: "", matchMode: "contains" },
      retailPrice: { value: "", matchMode: "contains" },
    } as Filters,
  });

  // Calls the Books API
  const callAPI = () => {
    // Only search by one of the search boxes
    let search_string = "";
    let title_only = false;
    let publisher_only = false;
    let author_only = false;
    let isbn_only = false;
    if (filterParams.filters.title.value) {
      search_string = filterParams.filters.title.value;
      title_only = true;
    } else if (filterParams.filters.publisher.value) {
      search_string = filterParams.filters.publisher.value;
      publisher_only = true;
    } else if (filterParams.filters.author.value) {
      search_string = filterParams.filters.author.value;
      author_only = true;
    } else if (filterParams.filters.isbn_13.value) {
      search_string = filterParams.filters.isbn_13.value ?? "";
      isbn_only = true;
    }

    // Invert sort order
    let sortField = sortParams.sortField;
    if (sortParams.sortOrder == -1) {
      sortField = "-".concat(sortField);
    }

    BOOKS_API.getBooks({
      page: pageParams.page ?? 0,
      page_size: pageParams.rows,
      ordering: sortField,
      genre: selectedGenre,
      search: search_string,
      title_only: title_only,
      publisher_only: publisher_only,
      author_only: author_only,
      isbn_only: isbn_only,
    }).then((response) => onAPIResponse(response));
  };

  // Set state when response to API call is received
  const onAPIResponse = (response: GetBooksResp) => {
    setBooks(response.books);
    setNumberOfBooks(response.numberOfBooks);
    setLoading(false);
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
    console.log(sortParams.sortOrder);
  };

  // Called when the paginator page is switched
  const onPage = (event: DataTablePageEvent) => {
    console.log(event.page);
    logger.debug("Page Applied", event);
    setLoading(true);
    setPageParams(event);
  };

  // Call endpoint on page load whenever any of these variables change
  useEffect(() => {
    callAPI();
  }, [sortParams, pageParams, filterParams, selectedGenre]);

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
        value={books}
        lazy
        responsiveLayout="scroll"
        filterDisplay="row"
        loading={loading}
        // Paginator
        paginator
        first={pageParams.first}
        rows={NUM_ROWS}
        totalRecords={numberOfBooks}
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
