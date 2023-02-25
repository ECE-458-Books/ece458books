import { useEffect, useState } from "react";
import { useImmer } from "use-immer";
import BooksDropdown, {
  BooksDropdownData,
} from "../components/dropdowns/BookDropdown";
import DisplayModeDropdown, {
  DisplayMode,
} from "../components/dropdowns/DisplayModeDropdown";
import { createColumns, TableColumn } from "../components/TableColumns";
import { filterById, findById } from "../util/IDOperations";
import { numberEditor } from "../util/TableCellEditFuncs";
import { Book } from "./list/BookList";
import { v4 as uuid } from "uuid";
import { DeleteTemplate } from "../util/EditDeleteTemplate";
import AddRowButton from "../components/buttons/AddRowButton";
import { DataTable } from "primereact/datatable";
import { Toolbar } from "primereact/toolbar";
import { Column } from "primereact/column";

const DEFAULT_HEIGHT = 8;
const DEFAULT_WIDTH = 5;
const DEFAULT_THICKNESS = 0.8;

interface ShelfCalculatorRow {
  id: string;
  bookTitle: string;
  stock: number;
  displayCount: number;
  displayMode: DisplayMode;
  shelfSpace: number;
  hasUnknownDimensions: boolean;
}

const emptyRow: ShelfCalculatorRow = {
  id: "",
  bookTitle: "",
  stock: 0,
  displayCount: 0,
  displayMode: DisplayMode.COVER_OUT,
  shelfSpace: 0,
  hasUnknownDimensions: false,
};

export default function ShelfCalculator() {
  const [rows, setRows] = useImmer<ShelfCalculatorRow[]>([]);
  const [totalShelfSpace, setTotalShelfSpace] = useState<number>(0);

  // For dropdown menus
  const [booksMap, setBooksMap] = useState<Map<string, Book>>(new Map());
  const [booksDropdownTitles, setBooksDropdownTitles] = useState<string[]>([]);

  const COLUMNS: TableColumn[] = [
    {
      field: "bookTitle",
      header: "Book",
      customBody: (rowData: ShelfCalculatorRow) =>
        booksDropDownEditor(rowData.bookTitle, (newValue) => {
          handleBookChange(rowData, newValue);
        }),
    },
    {
      field: "stock",
      header: "Current Inventory",
    },
    {
      field: "displayCount",
      header: "Display Count",
      customBody: (rowData: ShelfCalculatorRow) =>
        numberEditor(rowData.displayCount, (newValue) => {
          handleDisplayCountChange(rowData, newValue);
        }),
    },
    {
      field: "displayMode",
      header: "Display Count",
      customBody: (rowData: ShelfCalculatorRow) =>
        numberEditor(rowData.displayCount, (newValue) => {
          handleDisplayCountChange(rowData, newValue);
        }),
    },
    {
      field: "shelfSpace",
      header: "Shelf Space",
    },
  ];

  // Handlers for when data is changed

  const handleBookChange = (
    rowData: ShelfCalculatorRow,
    newBookTitle: string
  ) => {
    setRows((draft) => {
      const row = findById(draft, rowData.id);
    });
  };

  const handleDisplayCountChange = (
    rowData: ShelfCalculatorRow,
    newDisplayCount: number
  ) => {
    setRows((draft) => {
      const row = findById(draft, rowData.id);
    });
  };

  const handleDisplayModeChange = (
    rowData: ShelfCalculatorRow,
    newDisplayMode: DisplayMode
  ) => {
    setRows((draft) => {
      const row = findById(draft, rowData.id);
    });
  };

  // Dropdowns

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
  const booksDropDownEditor = (
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

  // Delete icon for each row
  const rowDeleteButton = DeleteTemplate<ShelfCalculatorRow>({
    onDelete: (rowData) => filterById(rows, rowData.id, setRows),
  });

  // Button for adding a new row
  const rowAddButton = AddRowButton<ShelfCalculatorRow>({
    emptyItem: emptyRow,
    setRows: setRows,
    rows: rows,
  });

  const columns = createColumns(COLUMNS);

  return (
    <div>
      <div className="grid flex justify-content-center">
        <link
          rel="stylesheet"
          href="https://unpkg.com/primeflex@3.1.2/primeflex.css"
        ></link>
        <div className="col-11">
          <div className="pt-2">
            <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
              Shelf Calculator
            </h1>
          </div>

          <Toolbar className="mb-4" left={rowAddButton} />
          <DataTable
            showGridlines
            value={rows}
            className="editable-cells-table"
            responsiveLayout="scroll"
            editMode="cell"
          >
            {columns}
            <Column
              body={rowDeleteButton}
              exportable={false}
              style={{ minWidth: "8rem" }}
            ></Column>
          </DataTable>
        </div>
      </div>
    </div>
  );
}
