import React from "react";
import Table, { TableColumn } from "../components/Table";

interface GenreListState {
  value: string;
}

interface GenreRow {
  genre: string;
  numBooks: number;
}

// Currently being used for filtering in booklist, will have to change
export const GENRE_DATA: GenreRow[] = [
  {
    genre: "blah",
    numBooks: 5,
  },
];

const COLUMNS: TableColumn[] = [
  { field: "genre", header: "Genre", filterPlaceholder: "Search by Genre" },
  {
    field: "numBooks",
    header: "Number of Books",
    filterPlaceholder: "Search by Number of Books",
  },
];

class GenreList extends React.Component<{}, GenreListState> {
  constructor(props = {}) {
    super(props);
    this.state = { value: "" };
  }

  render() {
    return <Table<GenreRow> columns={COLUMNS} data={GENRE_DATA} />;
  }
}

export default GenreList;
