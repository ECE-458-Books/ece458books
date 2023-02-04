import React, { FormEvent } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column, ColumnEditorOptions } from "primereact/column";
import { TableColumn } from "../../components/Table";
import {
  isPositiveInteger,
  numberEditor,
  priceBodyTemplate,
  priceEditor,
  textEditor,
} from "../../util/TableCellEditFuncs";

interface BookAddState {
  inputBoxText: string;
  data: BookRow[];
}

interface BookRow {
  title: string;
  authors: string;
  isbn: string;
  publisher: string;
  pubYear: number;
  pageCount: number;
  dimensions: string;
  retailPrice: number;
  genre: string;
}

const DATA: BookRow[] = [
  {
    title: "blah",
    authors: "blah",
    isbn: "blah",
    publisher: "blah",
    pubYear: 2000,
    pageCount: 3029,
    dimensions: "blah",
    retailPrice: 11.99,
    genre: "blah",
  },
  {
    title: "clah",
    authors: "clah",
    isbn: "clah",
    publisher: "clah",
    pubYear: 2000,
    pageCount: 3029,
    dimensions: "clah",
    retailPrice: 11.9,
    genre: "clah",
  },
];

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
    hidden: true,
  },
  {
    field: "pubYear",
    header: "Publication Year",
    filterPlaceholder: "Search by Publication Year",
    hidden: true,
  },
  {
    field: "pageCount",
    header: "Page Count",
    filterPlaceholder: "Search by Page Count",
    hidden: true,
  },
  {
    field: "dimensions",
    header: "Dimensions",
    filterPlaceholder: "Search by Dimensions",
    hidden: true,
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
  },
];

class BookAdd extends React.Component<{}, BookAddState> {
  constructor(props = {}) {
    super(props);
    this.state = { inputBoxText: "", data: DATA };
  }

  onCellEditComplete = (e: {
    rowData: any;
    newValue: any;
    field: string;
    originalEvent: React.SyntheticEvent;
  }) => {
    const { rowData, newValue, field, originalEvent: event } = e;

    switch (field) {
      case "pubYear":
        if (isPositiveInteger(newValue)) rowData[field] = newValue;
        else event.preventDefault();
        break;
      case "pageCount":
        if (isPositiveInteger(newValue)) rowData[field] = newValue;
        else event.preventDefault();
        break;
      case "retailPrice":
        if (isPositiveInteger(newValue)) rowData[field] = newValue;
        else event.preventDefault();
        break;
      default:
        if (newValue.trim().length > 0) rowData[field] = newValue;
        else event.preventDefault();
        break;
    }
  };

  cellEditor = (options: ColumnEditorOptions) => {
    switch (options.field) {
      case "pubYear":
        return numberEditor(options);
      case "pageCount":
        return numberEditor(options);
      case "retailPrice":
        return priceEditor(options);
      default:
        return textEditor(options);
    }
  };

  onSubmit = (): void => {
    alert("A form was submitted: \n" + this.state.inputBoxText);
  };

  onCompleteSubmit = (): void => {
    alert("Form Data" + JSON.stringify(DATA));
  };

  //Two Forms exist in order for the seperate submission of two seperate types of data.
  //First one is the submission of ISBNS that need to be added
  //Second one is the submission of the added books and their modified fields
  render() {
    return (
      <div>
        <form onSubmit={this.onSubmit}>
          <label htmlFor="addbook">Add Books (ISBN'S)</label>
          <InputTextarea
            id="addbook"
            name="addbook"
            value={this.state.inputBoxText}
            onChange={(e: FormEvent<HTMLTextAreaElement>) =>
              this.setState({ inputBoxText: e.currentTarget.value })
            }
            rows={5}
            cols={30}
          />
          <Button
            id="addbooksubmission"
            name="addbooksubmission"
            label="Submit"
            type="submit"
          />
        </form>
        <label htmlFor="addbookcompletion">Finish Book Addition</label>
        <form onSubmit={this.onCompleteSubmit}>
          <DataTable
            value={DATA}
            editMode="cell"
            className="editable-cells-table"
            responsiveLayout="scroll"
          >
            {COLUMNS.map(({ field, header }) => {
              return (
                <Column
                  key={field}
                  field={field}
                  header={header}
                  style={{ width: "25%" }}
                  body={field === "retailPrice" && priceBodyTemplate}
                  editor={(options) => this.cellEditor(options)}
                  onCellEditComplete={this.onCellEditComplete}
                />
              );
            })}
          </DataTable>
          <Button
            id="confirmbooks"
            name="confirmbooks"
            label="Confirm Addition"
            type="submit"
          />
        </form>
      </div>
    );
  }
}

export default BookAdd;
