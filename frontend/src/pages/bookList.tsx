import React from "react";
import Table, { TableColumn } from "../components/table";

interface BookListState {
  value: string;
}

interface BookRow {
  title: string;
  isbn: string;
}

const data: BookRow[] = [
  { isbn: "12", title: "name" },
  { isbn: "4312", title: "name 2" },
];

const columns: TableColumn[] = [
  { field: "isbn", header: "ISBN" },
  { field: "title", header: "Title" },
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
