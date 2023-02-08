import React, { FormEvent, ReactNode, useState } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column, ColumnEditorOptions, ColumnEvent } from "primereact/column";
import {
  isPositiveInteger,
  numberEditor,
  priceBodyTemplateRetailPrice,
  priceEditor,
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
  customBody?: any; // TODO: Remove this after ev 1
  cellEditValidator?: (event: ColumnEvent) => boolean;
  cellEditor?: (options: ColumnEditorOptions) => ReactNode;
}

export default function BookAdd() {
  const [textBox, setTextBox] = useState("");
  const [books, setBooks] = useState<BookWithDBTag[]>([]);

  const statusTemplate = (rowData: BookWithDBTag) => {
    if (rowData.fromDB) {
      return <Badge value="Exists"></Badge>;
    } else {
      return <Badge value="New" severity="success"></Badge>;
    }
  };

  // Properties of each column that change, the rest are set below when creating the actual Columns to be rendered
  const COLUMNS: TableColumn[] = [
    {
      field: "fromDB",
      header: "Book Status",
      filterPlaceholder: "Search by Book Status",
      customBody: statusTemplate,
      cellEditValidator: () => false,
    },
    {
      field: "id",
      header: "ID",
      filterPlaceholder: "Search by ID",
      cellEditValidator: () => false,
    },
    {
      field: "title",
      header: "Title",
      filterPlaceholder: "Search by Title",
      cellEditValidator: () => false,
    },
    {
      field: "author",
      header: "Authors",
      filterPlaceholder: "Search by Authors",
      cellEditValidator: () => false,
    },
    {
      field: "genres",
      header: "Genre",
      filterPlaceholder: "Search by Genre",
    },
    {
      field: "isbn_13",
      header: "ISBN",
      filterPlaceholder: "Search by ISBN",
      cellEditValidator: () => false,
    },
    {
      field: "isbn10",
      header: "ISBN",
      filterPlaceholder: "Search by ISBN",
      cellEditValidator: () => false,
    },
    {
      field: "publisher",
      header: "Publisher",
      filterPlaceholder: "Search by Publisher",
      cellEditValidator: () => false,
    },
    {
      field: "publishedYear",
      header: "Publication Year",
      filterPlaceholder: "Search by Publication Year",
      cellEditValidator: () => false,
    },
    {
      field: "pageCount",
      header: "Page Count",
      filterPlaceholder: "Search by Page Count",
      hidden: true,
      cellEditValidator: (event: ColumnEvent) =>
        isPositiveInteger(event.newValue),
      cellEditor: (options: ColumnEditorOptions) => numberEditor(options),
    },
    {
      field: "width",
      header: "Width",
      filterPlaceholder: "Search by Width",
      cellEditValidator: (event: ColumnEvent) =>
        isPositiveInteger(event.newValue),
      cellEditor: (options: ColumnEditorOptions) => numberEditor(options),
    },
    {
      field: "height",
      header: "Height",
      filterPlaceholder: "Search by Height",
      cellEditValidator: (event: ColumnEvent) =>
        isPositiveInteger(event.newValue),
      cellEditor: (options: ColumnEditorOptions) => numberEditor(options),
    },
    {
      field: "thickness",
      header: "Thickness",
      filterPlaceholder: "Search by Thickness",
      cellEditValidator: (event: ColumnEvent) =>
        isPositiveInteger(event.newValue),
      cellEditor: (options: ColumnEditorOptions) => numberEditor(options),
    },
    {
      field: "retailPrice",
      header: "Retail Price",
      filterPlaceholder: "Search by Price",
      customBody: priceBodyTemplateRetailPrice,
      cellEditValidator: (event: ColumnEvent) =>
        isPositiveInteger(event.newValue),
      cellEditor: (options: ColumnEditorOptions) => numberEditor(options),
    },
  ];

  const onCellEditComplete = (event: ColumnEvent) => {
    event.rowData[event.field] = event.newValue;
  };

  const onISBNInitialSubmit = (event: FormEvent<HTMLFormElement>): void => {
    logger.debug("Submitting Initial Book Lookup", textBox);
    BOOKS_API.addBookInitialLookup(textBox).then((response) =>
      setBooks(response)
    );
    event.preventDefault();
  };

  const validateRow = (book: BookWithDBTag) => {
    return book.retailPrice && book.genres;
  };

  const onFinalSubmit = (): void => {
    logger.debug("Submitting Final Book Add", books);
    for (const book of books) {
      if (validateRow(book))
        if (!book.fromDB) {
          BOOKS_API.addBookFinal(book);
        } else {
          BOOKS_API.modifyBook(book);
        }
    }
  };

  const columns = COLUMNS.map(
    ({ field, header, customBody, cellEditValidator, cellEditor }) => {
      return (
        <Column
          key={field}
          field={field}
          header={header}
          style={{ width: "25%" }}
          body={customBody}
          cellEditValidator={cellEditValidator}
          editor={cellEditor}
          onCellEditComplete={onCellEditComplete}
        />
      );
    }
  );

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
        <Button label="Clear" type="button" onClick={() => setTextBox("")} />
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
