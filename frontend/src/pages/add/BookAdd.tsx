import React, { FormEvent, useState } from "react";
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
import { BOOKS_API, GetBooksResp } from "../../apis/BooksAPI";
import { Book } from "../list/BookList";

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

export default function BookAdd() {
  const [textBox, setTextBox] = useState("");
  const [books, setBooks] = useState<Book[]>();

  const onCellEditComplete = (e: {
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

  const cellEditor = (options: ColumnEditorOptions) => {
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

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    BOOKS_API.addBookInitialLookup(textBox).then((response) =>
      onAPIResponse(response)
    );
    console.log(textBox);
    event?.preventDefault();
  };

  // Set state when response to API call is received
  const onAPIResponse = (response: any) => {
    setBooks(response.books);
    alert("Form Data" + JSON.stringify(books));
  };

  const onCompleteSubmit = (): void => {
    alert("Form Data" + JSON.stringify(books));
  };

  //Two Forms exist in order for the seperate submission of two seperate types of data.
  //First one is the submission of ISBNS that need to be added
  //Second one is the submission of the added books and their modified fields

  return (
    <div>
      <form onSubmit={onSubmit}>
        <label htmlFor="addbook">Add Books (ISBN'S)</label>
        <InputTextarea
          id="addbook"
          name="addbook"
          value={textBox}
          onChange={(e: FormEvent<HTMLTextAreaElement>) =>
            setTextBox(e.currentTarget.value)
          }
          rows={5}
          cols={30}
        />
        <Button label="Clear" type="button" onClick={() => setTextBox("")} />
        <Button
          id="addbooksubmission"
          name="addbooksubmission"
          label="Submit"
          type="submit"
        />
      </form>
      <label htmlFor="addbookcompletion">Finish Book Addition</label>
      <form onSubmit={onCompleteSubmit}>
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
                editor={(options) => cellEditor(options)}
                onCellEditComplete={onCellEditComplete}
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
