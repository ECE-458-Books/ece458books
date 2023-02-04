import { ColumnFilterElementTemplateOptions } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { GENRE_DATA } from "./GenreList";
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

interface Filters {
  [id: string]: DataTableFilterMetaData;
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

  const [sortParams, setSortParams] = useState<DataTableSortEvent>({
    sortField: "",
    sortOrder: null,
    multiSortMeta: null,
  });

  const [pageParams, setPageParams] = useState<DataTablePageEvent>({
    first: 0,
    rows: NUM_ROWS,
    page: 0,
  });

  const [filterParams, setFilterParams] = useState<DataTableFilterEvent>({
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
    } as Filters,
  });

  const callAPI = () => {
    //console.log(lazyParams);
    console.log(sortParams);
    console.log(filterParams);
    console.log(pageParams);
    BOOKS_API.getBooks({
      page: pageParams.page,
      page_size: pageParams.rows,
      ordering_field: sortParams.sortField,
      ordering_ascending: sortParams.sortOrder,
      genre: selectedGenre,
      search: filterParams.filters.title.value,
    }).then((response) => onAPIResponse(response));
  };

  const onAPIResponse = (response: GetBooksResp) => {
    setBooks(response.books);
    setNumberOfBooks(response.numberOfBooks);
    setLoading(false);
  };

  const onFilter = (event: DataTableFilterEvent) => {
    setLoading(true);
    setFilterParams(event);
  };

  const onSort = (event: DataTableSortEvent) => {
    setLoading(true);
    setSortParams(event);
  };

  const onPage = (event: DataTablePageEvent) => {
    setLoading(true);
    setPageParams(event);
  };

  useEffect(() => callAPI(), [pageParams, sortParams, filterParams]);

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
    <DataTable
      value={books}
      lazy
      responsiveLayout="scroll"
      filterDisplay="row"
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
      loading={loading}
    >
      {dynamicColumns}
    </DataTable>
  );
}
