import React from "react";
import Table, { TableColumn } from "../components/table";
import { Button } from "primereact/button";
//import { useNavigate } from "react-router-dom";

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
    this.handleClick = this.handleClick.bind(this);
  }

  //navigate = useNavigate();

  handleClick = () => {
    console.log("button clicked");
    //return this.navigate("/modifyBook");
  };

  render() {
    return (
      <div>
        <Button label="Modify" onClick={this.handleClick} />
        <Table<BookRow> columns={columns} data={data} />
      </div>
    );
  }
}

export default BookListPage;
