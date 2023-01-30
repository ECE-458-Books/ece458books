import React, { FormEvent } from "react";
import Table, { TableColumn } from "../components/table";
import { Button } from "primereact/button";
import ModifyButton from "../components/modifybutton";
import { InputTextarea } from "primereact/inputtextarea";

interface BookListState {
  value: string;
  addIsbns: string;
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
    this.state = { value: "", addIsbns: "" };
  }

  onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    alert("A form was submitted: \n" + this.state.addIsbns);

    event.preventDefault();
  };

  render() {
    return (
      <div>
        <ModifyButton path="/modifybook" />
        <form onSubmit={this.onSubmit}>
          <span className="p-float-label">
            <InputTextarea
              autoResize
              id="addIsbn"
              name="addIsbn"
              value={this.state.addIsbns}
              onChange={(event: FormEvent<HTMLTextAreaElement>): void =>
                this.setState({ addIsbns: event.currentTarget.value })
              }
              rows={2}
              cols={30}
            />
            <label htmlFor="addBooks">Add Books (ISBN's)</label>
          </span>
          <Button label="submit" type="submit" />
        </form>
        <Table<BookRow> columns={columns} data={data} />
      </div>
    );
  }
}

export default BookListPage;
