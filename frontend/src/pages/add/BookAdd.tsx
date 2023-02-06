import React, { FormEvent, useState } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column, ColumnEditorOptions } from "primereact/column";
import {
  isPositiveInteger,
  numberEditor,
  priceBodyTemplate,
  priceEditor,
  textEditor,
} from "../../util/TableCellEditFuncs";
import { BOOKS_API } from "../../apis/BooksAPI";
import { Book } from "../list/BookList";
import { Badge } from "primereact/badge";
import { logger } from "../../util/Logger";

export interface BookWithDBTag extends Book {
  fromDB: boolean;
}

interface TableColumn {
  field: string;
  header: string;
  filterPlaceholder?: string;
  hidden?: boolean;
  customBody?: (arg0: BookWithDBTag) => JSX.Element;
}

export default function BookAdd() {
  const [textBox, setTextBox] = useState("");
  const [books, setBooks] = useState<BookWithDBTag[]>([]);

  const statusTemplate = (rowData: BookWithDBTag) => {
    if (rowData.fromDB) {
      return <Badge value="Already Exists"></Badge>;
    } else {
      return <Badge value="New Book" severity="success"></Badge>;
    }
  };

  // Properties of each column that change, the rest are set below when creating the actual Columns to be rendered
  const COLUMNS: TableColumn[] = [
    {
      field: "fromDB",
      header: "Book Status",
      filterPlaceholder: "Search by Book Status",
      customBody: statusTemplate,
    },
    { field: "id", header: "ID", filterPlaceholder: "Search by ID" },
    { field: "title", header: "Title", filterPlaceholder: "Search by Title" },
    {
      field: "author",
      header: "Authors",
      filterPlaceholder: "Search by Authors",
    },
    {
      field: "genres",
      header: "Genre",
      filterPlaceholder: "Search by Genre",
    },
    { field: "isbn_13", header: "ISBN", filterPlaceholder: "Search by ISBN" },
    {
      field: "isbn10",
      header: "ISBN",
      filterPlaceholder: "Search by ISBN",
    },
    {
      field: "publisher",
      header: "Publisher",
      filterPlaceholder: "Search by Publisher",
    },
    {
      field: "publishedYear",
      header: "Publication Year",
      filterPlaceholder: "Search by Publication Year",
    },
    {
      field: "pageCount",
      header: "Page Count",
      filterPlaceholder: "Search by Page Count",
      hidden: true,
    },
    {
      field: "width",
      header: "Width",
      filterPlaceholder: "Search by Width",
    },
    {
      field: "height",
      header: "Height",
      filterPlaceholder: "Search by Height",
    },
    {
      field: "thickness",
      header: "Thickness",
      filterPlaceholder: "Search by Thickness",
    },
    {
      field: "retailPrice",
      header: "Retail Price",
      filterPlaceholder: "Search by Price",
    },
  ];

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

  const onISBNInitialSubmit = (event: FormEvent<HTMLFormElement>): void => {
    logger.debug("Submitting Initial Book Lookup", textBox);
    BOOKS_API.addBookInitialLookup(textBox).then((response) =>
      setBooks(response)
    );
    event.preventDefault();
  };

  const onFinalSubmit = (): void => {
    logger.debug("Submitting Final Book Add", books);
    for (const book of books) {
      if (!book.fromDB) {
        BOOKS_API.addBookFinal(book);
      }
    }
  };

  const columns = COLUMNS.map(({ field, header }) => {
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
  });

  //Two Forms exist in order for the seperate submission of two seperate types of data.
  //First one is the submission of ISBNS that need to be added
  //Second one is the submission of the added books and their modified fields

  return (
    <div>
      <form onSubmit={onISBNInitialSubmit}>
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
        <Button
          id="addbooksubmission"
          name="addbooksubmission"
          label="Submit"
          type="submit"
        />
      </form>
      <label htmlFor="addbookcompletion">Finish Book Addition</label>
      <form onSubmit={onFinalSubmit}>
        <DataTable
          value={books}
          editMode="cell"
          className="editable-cells-table"
          responsiveLayout="scroll"
        >
          {columns}
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
