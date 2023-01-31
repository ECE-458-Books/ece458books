<<<<<<< HEAD
import React, { FormEvent } from "react";
import Table, { TableColumn } from "../components/table";
import { Button } from "primereact/button";
import ModifyButton from "../components/modifybutton";
import { InputTextarea } from "primereact/inputtextarea";
=======
import React from "react";
import { ColumnFilterElementTemplateOptions } from "primereact/column";
import Table, { TableColumn } from "../components/Table";
import { Dropdown } from "primereact/dropdown";
import { GENRE_DATA } from "./GenreList";
import axios from "axios";
>>>>>>> list-view

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

const DATA: BookRow[] = [
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
  {
    title: "clah",
    authors: "clah",
    isbn: "clah",
    publisher: "clah",
    pubYear: "clah",
    pageCount: "clah",
    dimensions: "clah",
    retailPrice: "clah",
    genre: "clah",
  },
];

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
  },
  {
    field: "pubYear",
    header: "Publication Year",
    filterPlaceholder: "Search by Publication Year",
  },
  {
    field: "pageCount",
    header: "Page Count",
    filterPlaceholder: "Search by Page Count",
  },
  {
    field: "dimensions",
    header: "Dimensions",
    filterPlaceholder: "Search by Dimensions",
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

<<<<<<< HEAD
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
=======
  componentDidMount() {
    const reqOpts = {
      url: "http://books-dev.colab.duke.edu:8000/api/v1/books/isbns",
      headers: { "Content-Type": "application/json" },
      method: "POST",
      data: JSON.stringify({
        isbns: "9780425132159, 978-0131103627, 9780192797353",
      }),
    };

    axios.request(reqOpts).then((response) => console.log(response.data));
  }

  render() {
    return <Table<BookRow> columns={COLUMNS} data={DATA} />;
>>>>>>> list-view
  }
}

export default BookList;
