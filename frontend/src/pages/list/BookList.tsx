import { ColumnFilterElementTemplateOptions } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { GENRE_DATA } from "./GenreList";
import { BOOKS_API, GetBooksResp } from "../../apis/BooksAPI";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import { useEffect, useState } from "react";
import { DataTableFilterMetaData } from "primereact/datatable";

const NUM_ROWS = 3;

interface TableColumn {
  field: string;
  header: string;
  filterPlaceholder?: string;
  customFilter?: any;
  hidden?: boolean;
}

export interface Book {
  id: number;
  title: string;
  authors: string[];
  genres: string[];
  isbn13: string;
  isbn10: string;
  publisher: string;
  publishedYear: number;
  pageCount: number;
  width: number;
  height: number;
  thickness: number;
  retailPrice: number;
}

interface LazyParams {
  first: number;
  rows: number;
  page: number;
  sortField: string | undefined;
  sortOrder: 0 | 1 | -1 | null | undefined;
  filters: {
    id: DataTableFilterMetaData;
    title: DataTableFilterMetaData;
    authors: DataTableFilterMetaData;
    isbn13: DataTableFilterMetaData;
    isbn10: DataTableFilterMetaData;
    publisher: DataTableFilterMetaData;
    publishedYear: DataTableFilterMetaData;
    pageCount: DataTableFilterMetaData;
    width: DataTableFilterMetaData;
    height: DataTableFilterMetaData;
    thickness: DataTableFilterMetaData;
    retailPrice: DataTableFilterMetaData;
  };
}

export default function BookList() {
  const [selectedGenre, setSelectedGenre] = useState<string>("");

  const genreFilter = (options: ColumnFilterElementTemplateOptions) => {
    return (
      <Dropdown
        value={options.value}
        options={GENRE_DATA.map((genreRow) => genreRow.genre)}
        appendTo={"self"}
        onChange={(e) => options.filterApplyCallback(e.value)}
        placeholder={"Select Genre"}
      />
    );
  };

  const COLUMNS: TableColumn[] = [
    { field: "id", header: "ID", filterPlaceholder: "Search by ID" },
    { field: "title", header: "Title", filterPlaceholder: "Search by Title" },
    {
      field: "authors",
      header: "Authors",
      filterPlaceholder: "Search by Authors",
    },
    {
      field: "genres",
      header: "Genre",
      filterPlaceholder: "Search by Genre",
      customFilter: genreFilter,
    },
    { field: "isbn13", header: "ISBN", filterPlaceholder: "Search by ISBN" },
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
      hidden: true,
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

  const [loading, setLoading] = useState(false); // Whether we show that the table is loading or not
  const [numberOfBooks, setNumberOfBooks] = useState(0); // The number of books that match the query
  const [books, setBooks] = useState<Book[]>([]); // The book data itself
  //const [selectAll, setSelectAll] = useState(false);
  //const [selectedCustomers, setSelectedCustomers] = useState(null);
  //const [selectedRepresentative, setSelectedRepresentative] = useState(null);

  const [lazyParams, setLazyParams] = useState<LazyParams>({
    first: 0,
    rows: NUM_ROWS,
    page: 1,
    sortField: undefined,
    sortOrder: null,
    filters: {
      id: { value: "", matchMode: "contains" },
      title: { value: "", matchMode: "contains" },
      authors: { value: "", matchMode: "contains" },
      isbn13: { value: "", matchMode: "contains" },
      isbn10: { value: "", matchMode: "contains" },
      publisher: { value: "", matchMode: "contains" },
      publishedYear: { value: "", matchMode: "contains" },
      pageCount: { value: "", matchMode: "contains" },
      width: { value: "", matchMode: "contains" },
      height: { value: "", matchMode: "contains" },
      thickness: { value: "", matchMode: "contains" },
      retailPrice: { value: "", matchMode: "contains" },
    },
  });

  const callAPI = () => {
    BOOKS_API.getBooks({
      page: lazyParams.page,
      page_size: lazyParams.rows,
      ordering_field: lazyParams.sortField,
      ordering_ascending: lazyParams.sortOrder,
      genre: selectedGenre,
      search: "",
    }).then((response) => onAPIResponse(response));
  };

  const onAPIResponse = (response: GetBooksResp) => {
    setBooks(response.books);
    setNumberOfBooks(response.numberOfBooks);
    setLoading(false);
  };

  const onFilter = (event: any) => {
    setLoading(true);
    setLazyParams(event);
    callAPI();
  };

  const onSort = (event: any) => {
    setLoading(true);
    setLazyParams(event);
    callAPI();
  };

  const onPage = (event: any) => {
    setLoading(true);
    setLazyParams(event);
    callAPI();
  };

  useEffect(() => callAPI());

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
        filterMatchMode={"contains"}
        filterPlaceholder={col.filterPlaceholder}
        // Sorting
        sortable
        sortField={col.field}
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
    <DataTable
      value={books}
      lazy
      responsiveLayout="scroll"
      filterDisplay="row"
      paginator
      first={lazyParams.first}
      rows={NUM_ROWS}
      totalRecords={numberOfBooks}
      paginatorTemplate="PrevPageLink NextPageLink"
      // Function is called in order to invoke API request on pagination, sort, or filter
      onPage={onPage}
      onSort={onSort}
      sortField={lazyParams.sortField}
      sortOrder={lazyParams.sortOrder}
      onFilter={onFilter}
      filters={lazyParams.filters}
      loading={loading}
    >
      {dynamicColumns}
    </DataTable>
  );
}
