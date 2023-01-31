import React, { FormEvent } from "react";
import Table, { TableColumn } from "../components/table";
import ModifyButton from "../components/modifybutton";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";

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
<<<<<<< HEAD
    return (
      <div>
        <ModifyButton path="/modifygenre" />
        <form onSubmit={this.onSubmit}>
          <span className="p-float-label">
            <InputTextarea
              autoResize
              id="addGenres"
              name="addGenres"
              value={this.state.addGenres}
              onChange={(event: FormEvent<HTMLTextAreaElement>): void =>
                this.setState({ addGenres: event.currentTarget.value })
              }
              rows={2}
              cols={30}
            />
            <label htmlFor="username">Add Genres</label>
          </span>
          <Button label="submit" type="submit" />
        </form>
        <Table<GenreRow> columns={columns} data={data} />
      </div>
    );
=======
    return <Table<GenreRow> columns={COLUMNS} data={GENRE_DATA} />;
>>>>>>> list-view
  }
}

export default GenreList;
