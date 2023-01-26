import React from "react";
import internal from "stream";
import Table, { TableColumn } from "../components/table";

interface GenreListState {
  value: string;
}

interface GenreRow {
  genre: string;
  numBooks: int;
}

const data: BookRow[] = [
  {
    title: "blah",
    authors: "blah",
    isbn: "blah",
    publisher: "blah",
    pubYear: "blah",
    pageCount: "blah",
    dimensions: "blah",
    retailPrice: "blah",
    genre: "blah",
  },
];

const columns: TableColumn[] = [
  { field: "title", header: "Title" },
  { field: "authors", header: "Authors" },
  { field: "isbn", header: "ISBN" },
  { field: "publisher", header: "Publisher" },
  { field: "pubYear", header: "Publication Year" },
  { field: "pageCount", header: "Page Count" },
  { field: "dimensions", header: "Dimensions" },
  { field: "retailPrice", header: "Retail Price" },
  { field: "genre", header: "Genre" },
];

class BookListPage extends React.Component<{}, BookListState> {
  constructor(props = {}) {
    super(props);
    this.state = { value: "" };
  }

  render() {
    return <Table<BookRow> columns={columns} data={data} />;
  }
}

export default BookListPage;
