import React from "react";
import Table, { TableColumn } from "../components/Table";

interface BookListState {
  value: string;
}

interface BookRow {
  title: string;
  authors: string;
  isbn: string;
  publisher: string;
  pubYear: string;
  pageCount: string;
  dimensions: string;
  retailPrice: string;
  genre: string;
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
