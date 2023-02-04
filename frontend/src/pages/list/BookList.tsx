import React, { FormEvent } from "react";
import Table, { TableColumn } from "../../components/Table";
import { ColumnFilterElementTemplateOptions } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { GENRE_DATA } from "./GenreList";
import { BOOKS_API } from "../../apis/BooksAPI";
import DataTableStateEvent from "primereact/datatable";

interface BookListState {
  selectedGenre: string;
  books: Book[];
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

export class BookList extends React.Component<{}, BookListState> {
  constructor(props = {}) {
    super(props);
    this.state = { selectedGenre: "", books: [] };
  }

  componentDidMount(): void {
    BOOKS_API.getBooks({ page: 1, page_size: 5 }).then((response) =>
      this.setState({ books: response })
    );
  }

  render() {
    console.log(this.state.books);
    return <Table<Book> columns={COLUMNS} data={this.state.books} />;
  }
}
