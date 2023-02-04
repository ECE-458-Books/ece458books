import React, { FormEvent } from "react";
import Table, { TableColumn } from "../../components/Table";
import { ColumnFilterElementTemplateOptions } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { GENRE_DATA } from "./GenreList";

interface BookListState {
  value: string;
  addIsbns: string;
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
  {
    field: "authors",
    header: "Authors",
    filterPlaceholder: "Search by Authors",
  },
  { field: "isbn", header: "ISBN", filterPlaceholder: "Search by ISBN" },
  {
    field: "publisher",
    header: "Publisher",
    filterPlaceholder: "Search by Publisher",
    hidden: true,
  },
  {
    field: "pubYear",
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
    field: "dimensions",
    header: "Dimensions",
    filterPlaceholder: "Search by Dimensions",
    hidden: true,
  },
  {
    field: "retailPrice",
    header: "Retail Price",
    filterPlaceholder: "Search by Price",
  },
  {
    field: "genre",
    header: "Genre",
    filterPlaceholder: "Search by Genre",
    customFilter: genreFilter,
  },
];

class BookList extends React.Component<{}, BookListState> {
  constructor(props = {}) {
    super(props);
    this.state = { value: "", addIsbns: "" };
  }

  onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    alert("A form was submitted: \n" + this.state.addIsbns);

    event.preventDefault();
  };
  render() {
    return <Table<Book> columns={COLUMNS} data={DATA} />;
  }
}

export default BookList;
