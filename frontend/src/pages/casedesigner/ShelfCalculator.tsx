import { useEffect, useState } from "react";
import { useImmer } from "use-immer";
import BooksDropdown, {
  BooksDropdownData,
} from "../../components/dropdowns/BookDropdown";
import DisplayModeDropdown, {
  DisplayMode,
} from "../../components/dropdowns/DisplayModeDropdown";
import {
  createColumns,
  TableColumn,
} from "../../components/datatable/TableColumns";
import { filterById } from "../../util/IDOps";
import { Book } from "../books/BookList";
import AddRowButton from "../../components/buttons/AddRowButton";
import { DataTable } from "primereact/datatable";
import { Toolbar } from "primereact/toolbar";
import BackButton from "../../components/buttons/BackButton";
import { calculateTotalShelfSpace } from "./util/Calculations";
import { DisplayBook } from "./BookcaseList";
import {
  updateDisplayBookOnTitleChange,
  updateDisplayBookOnCountChange,
  updateDisplayBookOnModeChange,
} from "./util/Updaters";
import DeleteColumn from "../../components/datatable/DeleteColumn";
import { IntegerEditor } from "../../components/editors/IntegerEditor";

const emptyRow: DisplayBook = {
  id: "",
  bookId: "0",
  bookISBN: "",
  bookTitle: "",
  bookImageURL: "",
  stock: 1,
  displayCount: 1,
  maxDisplayCount: 1,
  displayMode: DisplayMode.SPINE_OUT,
  shelfSpace: 0,
  hasUnknownDimensions: false,
};

export default function ShelfCalculator() {
  const [rows, setRows] = useImmer<DisplayBook[]>([]);
  const [totalShelfSpace, setTotalShelfSpace] = useState<number>(0);

  // For dropdown menus
  const [booksMap, setBooksMap] = useState<Map<string, Book>>(new Map());
  const [booksDropdownTitles, setBooksDropdownTitles] = useState<string[]>([]);

  const COLUMNS: TableColumn<DisplayBook>[] = [
    {
      field: "bookTitle",
      header: "Book",
      customBody: (rowData: DisplayBook) =>
        booksDropdownEditor(rowData.bookTitle, (newValue) => {
          updateDisplayBookOnTitleChange(
            setDisplayBook,
            rowData,
            newValue,
            booksMap
          );
        }),
      style: { width: "40%" },
    },
    {
      field: "stock",
      header: "Current Inventory",
      style: { width: "10%" },
    },
    {
      field: "displayCount",
      header: "Display Count",
      customBody: (rowData: DisplayBook) =>
        IntegerEditor(
          rowData.displayCount,
          (newValue) => {
            updateDisplayBookOnCountChange(
              setDisplayBook,
              rowData,
              newValue,
              booksMap
            );
          },
          "",
          false,
          0, // min
          rowData.maxDisplayCount // max, undefined if spine out
        ),
      style: { width: "10%" },
    },
    {
      field: "displayMode",
      header: "Display Mode",
      customBody: (rowData: DisplayBook) =>
        displayModeDropdownEditor(rowData.displayMode, (newValue) => {
          updateDisplayBookOnModeChange(
            setDisplayBook,
            rowData,
            newValue,
            booksMap
          );
        }),
      style: { width: "20%" },
    },
    {
      field: "shelfSpace",
      header: "Shelf Space (inches)",
      style: { width: "10%" },
      customBody: (rowData: DisplayBook) =>
        `${rowData.shelfSpace}${rowData.hasUnknownDimensions ? "*" : ""}`,
    },
  ];

  const setDisplayBook = (displayBook: DisplayBook) => {
    setRows((draft) => {
      const index = draft.findIndex((row) => row.id === displayBook.id);
      draft[index] = displayBook;
      setTotalShelfSpace(calculateTotalShelfSpace(draft));
    });
  };

  // Get the data for the books dropdown
  useEffect(
    () =>
      BooksDropdownData({
        setBooksMap: setBooksMap,
        setBookTitlesList: setBooksDropdownTitles,
      }),
    []
  );

  // The books dropdown
  const booksDropdownEditor = (
    value: string,
    onChange: (newValue: string) => void
  ) => (
    <BooksDropdown
      setSelectedBook={onChange}
      selectedBook={value}
      bookTitlesList={booksDropdownTitles}
      placeholder={value}
    />
  );

  // The display mode dropdown
  const displayModeDropdownEditor = (
    value: DisplayMode,
    onChange: (newValue: DisplayMode) => void
  ) => (
    <DisplayModeDropdown
      setSelectedDisplayMode={onChange}
      selectedDisplayMode={value}
    />
  );

  // Button for adding a new row
  const rowAddButton = AddRowButton<DisplayBook>({
    emptyItem: emptyRow,
    setRows: setRows,
    rows: rows,
  });

  const deleteColumn = DeleteColumn<DisplayBook>({
    onDelete: (rowData) => {
      const newRows = filterById(rows, rowData.id, setRows);
      setTotalShelfSpace(calculateTotalShelfSpace(newRows));
    },
  });

  const columns = createColumns(COLUMNS);

  const backButton = (
    <div className="flex col-1">
      <BackButton className="ml-1" />
    </div>
  );

  return (
    <div className="grid flex justify-content-center">
      <div className="flex col-12 p-0">
        {backButton}
        <div className="pt-2 col-10">
          <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
            Shelf Calculator
          </h1>
        </div>
      </div>
      <div className="col-11">
        <Toolbar
          className="mb-4"
          left={rowAddButton}
          right={`Total Shelf Space (inches): ${totalShelfSpace}`}
        />
        <DataTable
          showGridlines
          value={rows}
          className="editable-cells-table"
          responsiveLayout="scroll"
          editMode="cell"
        >
          {columns}
          {deleteColumn}
        </DataTable>
      </div>
    </div>
  );
}
