import React, { FormEvent } from "react";
import Table, { TableColumn } from "../../components/Table";

interface GenreListState {
  value: string;
  addGenres: string;
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
    this.state = { value: "", addGenres: "" };
  }

  onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    alert("A form was submitted: \n" + this.state.addGenres);

    event.preventDefault();
  };

  render() {
    return <Table<GenreRow> columns={COLUMNS} data={GENRE_DATA} />;
  }
}

export default GenreList;
