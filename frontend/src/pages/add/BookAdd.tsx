import { FormEvent, useRef, useState } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { numberEditor, priceEditor } from "../../util/TableCellEditFuncs";
import { BOOKS_API } from "../../apis/BooksAPI";
import { Book } from "../list/BookList";
import { Badge } from "primereact/badge";
import { logger } from "../../util/Logger";
import { Toast } from "primereact/toast";
import {
  APIToInternalBookConversionWithDB,
  InternalToAPIBookConversion,
} from "../../apis/Conversions";
import { createColumns, TableColumn } from "../../components/TableColumns";
import GenreDropdown from "../../components/dropdowns/GenreDropdown";
import { ColumnEditorOptions } from "primereact/column";

export interface BookWithDBTag extends Book {
  fromDB: boolean;
}

export default function BookAdd() {
  const [textBox, setTextBox] = useState<string>("");
  const [books, setBooks] = useState<BookWithDBTag[]>([]);

  const statusTemplate = (rowData: BookWithDBTag) => {
    if (rowData.fromDB) {
      return <Badge value="Exists"></Badge>;
    } else {
      return <Badge value="New" severity="success"></Badge>;
    }
  };

  const genreDropdown = (options: ColumnEditorOptions) => (
    <GenreDropdown
      // This will always be used in a table cell, so we can disable the warning
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      setSelectedGenre={options.editorCallback!}
      selectedGenre={options.value}
      isTableCell
    />
  );

  // Properties of each column that change, the rest are set below when creating the actual Columns to be rendered
  const COLUMNS: TableColumn[] = [
    {
      field: "fromDB",
      header: "Book Status",
      customBody: statusTemplate,
      style: { width: "5%" },
    },
    {
      field: "title",
      header: "Title",
      style: { width: "15%" },
    },
    {
      field: "author",
      header: "Authors",
      style: { width: "10%" },
    },
    {
      field: "genres",
      header: "Genre",
      style: { width: "20%" },
      cellEditor: (options) => genreDropdown(options),
    },
    {
      field: "isbn13",
      header: "ISBN 13",
      style: { width: "10%" },
    },
    {
      field: "isbn10",
      header: "ISBN",
      style: { width: "10%" },
    },
    {
      field: "publisher",
      header: "Publisher",
      style: { width: "10%" },
    },
    {
      field: "publishedYear",
      header: "Publication Year",
      style: { width: "5%" },
    },
    {
      field: "pageCount",
      header: "Page Count",
      style: { width: "5%" },
      customBody: (rowData: BookWithDBTag) =>
        numberEditor(
          rowData.pageCount,
          (newValue) => (rowData.pageCount = newValue)
        ),
    },
    {
      field: "width",
      header: "Width",
      style: { width: "5%" },
      customBody: (rowData: BookWithDBTag) =>
        numberEditor(rowData.width, (newValue) => (rowData.width = newValue)),
    },
    {
      field: "height",
      header: "Height",
      style: { width: "5%" },
      customBody: (rowData: BookWithDBTag) =>
        numberEditor(rowData.height, (newValue) => (rowData.height = newValue)),
    },
    {
      field: "thickness",
      header: "Thickness",
      style: { width: "5%" },
      customBody: (rowData: BookWithDBTag) =>
        numberEditor(
          rowData.thickness,
          (newValue) => (rowData.thickness = newValue)
        ),
    },
    {
      field: "retailPrice",
      header: "Retail Price",
      style: { width: "5%" },
      customBody: (rowData: BookWithDBTag) =>
        priceEditor(
          rowData.retailPrice,
          (newValue) => (rowData.retailPrice = newValue)
        ),
    },
  ];

  const onISBNInitialSubmit = (event: FormEvent<HTMLFormElement>): void => {
    logger.debug("Submitting Initial Book Lookup", textBox);
    BOOKS_API.addBookInitialLookup({ isbns: textBox })
      .then((response) => {
        setBooks(
          response.books.map((book) => APIToInternalBookConversionWithDB(book))
        );
        if (response.invalid_isbns.length > 0) {
          showFailure(
            "The following ISBNs were not successfully added: ".concat(
              response.invalid_isbns.toString()
            )
          );
        }
      })
      .catch(() => showFailure("Could not add books"));

    event.preventDefault();
  };

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  const showSuccess = () => {
    toast.current?.show({ severity: "success", summary: "Books Added" });
  };

  const showFailure = (message: string) => {
    toast.current?.show({
      severity: "error",
      summary: message,
      sticky: true,
    });
  };

  const validateRow = (book: BookWithDBTag) => {
    return book.retailPrice > 0 && book.genres;
  };

  const onFinalSubmit = (event: FormEvent<HTMLFormElement>): void => {
    // Validate before submitting any additions
    for (const book of books) {
      console.log(!validateRow(book));
      if (!validateRow(book)) {
        showFailure(
          "The following book does not have all required fields set: ".concat(
            book.title
          )
        );
        event.preventDefault();
        return;
      }
    }

    logger.debug("Submitting Final Book Add", books);

    for (const book of books) {
      if (!book.fromDB) {
        BOOKS_API.addBookFinal({
          book: InternalToAPIBookConversion(book),
        }).catch(() => showFailure("Could not add ".concat(book.title)));
      } else {
        // BOOKS_API.modifyBook({ book: InternalToAPIBookConversion(book) }).catch(
        //   () => showFailure("Could not modify ".concat(book.title))
        // );
      }
    }

    event.preventDefault();
    showSuccess();
  };

  const columns = createColumns(COLUMNS);

  //Two Forms exist in order for the seperate submission of two seperate types of data.
  //First one is the submission of ISBNS that need to be added
  //Second one is the submission of the added books and their modified fields

  return (
    <div className="grid flex justify-content-center">
      <div className="col-11">
        <div className="py-1">
          <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
            Add Books
          </h1>
        </div>
        <form onSubmit={onISBNInitialSubmit}>
          <Toast ref={toast} />
          <div className="justify content center col-6 col-offset-3">
            <div className="py-2">
              <label
                className="text-xl p-component text-teal-900 p-text-secondary"
                htmlFor="addbook"
              >
                Enter ISBN-13 values, separated by comma or space:
              </label>
            </div>
            <InputTextarea
              id="addbook"
              name="addbook"
              value={textBox}
              onChange={(e: FormEvent<HTMLTextAreaElement>) =>
                setTextBox(e.currentTarget.value)
              }
              rows={5}
              cols={30}
              className="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full"
            />
            <div className="flex flex-row justify-content-between card-container col-12">
              <Button
                label="Clear"
                type="button"
                onClick={() => setTextBox("")}
                className="p-button-info"
              />
              <Button
                id="addbooksubmission"
                name="addbooksubmission"
                label="Lookup"
                type="submit"
                className="p-button-success p-button-raised"
              />
            </div>
          </div>
        </form>
        <div className="pt-3">
          <label
            htmlFor="addbookcompletion"
            className="p-component p-text-secondary text-3xl text-center text-900 color: var(--surface-800);"
          >
            Edit Fields
          </label>
        </div>
        <form onSubmit={onFinalSubmit}>
          <DataTable
            value={books}
            showGridlines
            editMode="cell"
            className="editable-cells-table py-5"
            responsiveLayout="scroll"
          >
            {columns}
          </DataTable>
          <div className="col-12 col-offset-5">
            <Button
              id="confirmbooks"
              name="confirmbooks"
              label="Submit"
              type="submit"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
