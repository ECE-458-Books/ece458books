import { ColumnFilterElementTemplateOptions } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { GENRE_DATA } from "./GenreList";
import { BOOKS_API } from "../../apis/BooksAPI";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import { useEffect, useState } from "react";

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
  { field: "title", header: "Title", filterPlaceholder: "Search by Title" },
  { field: "isbn13", header: "ISBN", filterPlaceholder: "Search by ISBN" },
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
    field: "retailPrice",
    header: "Retail Price",
    filterPlaceholder: "Search by Price",
  },
];

export default function BookList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>("");

  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 1,
    sortField: null,
    sortOrder: null,
    filters: {
      name: { value: "" },
      "country.name": { value: "" },
      company: { value: "" },
      "representative.name": { value: "" },
    },
  });

  const onTableComponentChange = (event: any) => {
    console.log("blah");
  };

  useEffect(() => {
    BOOKS_API.getBooks({ page: 1, page_size: 5 }).then((response) =>
      setBooks(response)
    );
  });

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
      responsiveLayout="scroll"
      filterDisplay="row"
      paginator
      rows={10}
      paginatorTemplate="PrevPageLink NextPageLink"
      // Function is called in order to invoke API request on pagination, sort, or filter
      //onPage={onTableComponentChange}
      //onSort={onTableComponentChange}
      //onFilter={onTableComponentChange}
    >
      {dynamicColumns}
    </DataTable>
  );
}
