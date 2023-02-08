import React, {
  FormEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column, ColumnEditorOptions, ColumnEvent } from "primereact/column";
import {
  isPositiveInteger,
  numberEditor,
  priceBodyTemplate,
  priceEditor,
} from "../../util/TableCellEditFuncs";
import { BOOKS_API } from "../../apis/BooksAPI";
import { Book } from "../list/BookList";
import { Badge } from "primereact/badge";
import { logger } from "../../util/Logger";
import { Toast } from "primereact/toast";
import { GENRES_API } from "../../apis/GenresAPI";
import { Dropdown } from "primereact/dropdown";

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

  // The dropdown configuration for each cell
  const [genreList, setGenreList] = useState<string[]>([]);
  useEffect(() => {
    GENRES_API.getGenres({
      page: 0,
      page_size: 30,
      ordering: "name",
    }).then((response) =>
      setGenreList(response.genres.map((genre) => genre.name))
    );
  }, []);

  const [seed, setSeed] = useState<number>(0);

  const reloadDropdowns = () => {
    setSeed(Math.random());
  };

  const genreDropdown = (rowData: BookWithDBTag) => {
    return (
      <Dropdown
        key={seed}
        value={rowData.genres}
        options={genreList}
        appendTo={"self"}
        onChange={(e) => {
          rowData.genres = e.value;
          reloadDropdowns();
        }}
        placeholder={"Select Genre"}
        showClear
        virtualScrollerOptions={{ itemSize: 35 }}
      />
    );
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
      hidden: true,
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
      customBody: genreDropdown,
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
      cellEditValidator: (event: ColumnEvent) => event.newValue > 0,
      cellEditor: (options: ColumnEditorOptions) => numberEditor(options),
    },
    {
      field: "height",
      header: "Height",
      filterPlaceholder: "Search by Height",
      cellEditValidator: (event: ColumnEvent) => event.newValue > 0,
      cellEditor: (options: ColumnEditorOptions) => numberEditor(options),
    },
    {
      field: "thickness",
      header: "Thickness",
      filterPlaceholder: "Search by Thickness",
      cellEditValidator: (event: ColumnEvent) => event.newValue > 0,
      cellEditor: (options: ColumnEditorOptions) => numberEditor(options),
    },
    {
      field: "retailPrice",
      header: "Retail Price",
      filterPlaceholder: "Search by Price",
      customBody: priceBodyTemplate,
      cellEditValidator: (event: ColumnEvent) => event.newValue > 0,
      cellEditor: (options: ColumnEditorOptions) => numberEditor(options),
    },
  ];

  const onCellEditComplete = (event: ColumnEvent) => {
    event.rowData[event.field] = event.newValue;
  };

  const onISBNInitialSubmit = (event: FormEvent<HTMLFormElement>): void => {
    logger.debug("Submitting Initial Book Lookup", textBox);
    BOOKS_API.addBookInitialLookup(textBox).then((response) => {
      setBooks(response.books);
      if (response.invalidISBNS.length > 0) {
        showFailure(
          "The following ISBNs were not successfully added: ".concat(
            response.invalidISBNS.toString()
          )
        );
      }
    });

    event.preventDefault();
  };

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  const showSuccess = () => {
    toast.current?.show({ severity: "success", summary: "Books Added" });
  };

  const showFailure = (message: string) => {
    toast.current?.show({ severity: "error", summary: message });
  };

  const validateRow = (book: BookWithDBTag) => {
    return book.retailPrice > 0 && book.genres;
  };

  const onFinalSubmit = (event: FormEvent<HTMLFormElement>): void => {
    // Validate before submitting any additions
    for (const book of books) {
      console.log(!validateRow(book));
      if (!validateRow(book)) {
        console.log("show fail");
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
        BOOKS_API.addBookFinal(book);
      } else {
        BOOKS_API.modifyBook(book);
      }
    }

    event.preventDefault();
    showSuccess();
  };

  const columns = COLUMNS.map((col) => {
    return (
      <Column
        key={col.field}
        field={col.field}
        header={col.header}
        style={{ width: "25%" }}
        body={col.customBody}
        cellEditValidator={col.cellEditValidator}
        editor={col.cellEditor}
        onCellEditComplete={onCellEditComplete}
        hidden={col.hidden ?? false}
      />
    );
  });

  //Two Forms exist in order for the seperate submission of two seperate types of data.
  //First one is the submission of ISBNS that need to be added
  //Second one is the submission of the added books and their modified fields

  return (
    <div>
      <form onSubmit={onISBNInitialSubmit}>
        <Toast ref={toast} />
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
