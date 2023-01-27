import React from "react";
import Table, { TableColumn } from "../components/Table";

interface GenreListState {
  value: string;
}

interface GenreRow {
  genre: string;
  numBooks: number;
}

const data: GenreRow[] = [
  {
    genre: "blah",
    numBooks: 5,
  },
];

const columns: TableColumn[] = [
  { field: "genre", header: "Genre" },
  { field: "numBooks", header: "Number of Books" },
];

class BookListPage extends React.Component<{}, GenreListState> {
  constructor(props = {}) {
    super(props);
    this.state = { value: "" };
  }

  render() {
    return <Table<GenreRow> columns={columns} data={data} />;
  }
}

export default BookListPage;
