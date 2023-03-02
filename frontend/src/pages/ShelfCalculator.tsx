import { useEffect, useState } from "react";
import { useImmer } from "use-immer";
import BooksDropdown, {
  BooksDropdownData,
  formatBookForDropdown,
} from "../components/dropdowns/BookDropdown";
import DisplayModeDropdown, {
  DisplayMode,
} from "../components/dropdowns/DisplayModeDropdown";
import { createColumns, TableColumn } from "../components/TableColumns";
import { filterById, findById } from "../util/IDOperations";
import {
  alteredTextBodyTemplate,
  numberEditor,
} from "../util/TableCellEditFuncs";
import { Book } from "./list/BookList";
import { DeleteTemplate } from "../util/EditDeleteTemplate";
import AddRowButton from "../components/buttons/AddRowButton";
import { DataTable } from "primereact/datatable";
import { Toolbar } from "primereact/toolbar";
import { Column } from "primereact/column";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/buttons/BackButton";

const DEFAULT_WIDTH = 5;
const DEFAULT_HEIGHT = 8;
export const DEFAULT_THICKNESS = 0.5;
const SHELF_DEPTH = 8;

interface ShelfCalculatorRow {
  id: string;
  bookISBN: string;
  bookTitle: string;
  stock: number;
  displayCount: number;
  maxDisplayCount: number;
  displayMode: DisplayMode;
  shelfSpace: number; // This measures the horizontal distance on store shelves
  hasUnknownDimensions: boolean;
}

const emptyRow: ShelfCalculatorRow = {
  id: "",
  bookISBN: "",
  bookTitle: "",
  stock: 1,
  displayCount: 1,
  maxDisplayCount: 1,
  displayMode: DisplayMode.SPINE_OUT,
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
        booksDropdownEditor(rowData.bookTitle, (newValue) => {
          handleBookChange(rowData, newValue);
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
      customBody: (rowData: ShelfCalculatorRow) =>
        numberEditor(
          rowData.displayCount,
          (newValue) => {
            handleDisplayCountChange(rowData, newValue);
          },
          "",
          false,
          0, // min
          rowData.maxDisplayCount // max
        ),
      style: { width: "10%" },
    },
    {
      field: "displayMode",
      header: "Display Mode",
      customBody: (rowData: ShelfCalculatorRow) =>
        displayModeDropdownEditor(rowData.displayMode, (newValue) => {
          handleDisplayModeChange(rowData, newValue);
        }),
      style: { width: "20%" },
    },
    {
      field: "shelfSpace",
      header: "Shelf Space (Bold=Estimation)",
      style: { width: "10%" },
      customBody: (rowData: ShelfCalculatorRow) =>
        alteredTextBodyTemplate(
          rowData.hasUnknownDimensions ? "font-bold" : "",
          Math.round(rowData.shelfSpace * 100) / 100
        ),
    },
  ];

  const calculateShelfSpace = (row: ShelfCalculatorRow) => {
    const book = booksMap.get(row.bookTitle)!;
    const width = book.width ?? DEFAULT_WIDTH;
    const thickness = book.thickness ?? DEFAULT_THICKNESS;

    if (row.displayMode == DisplayMode.SPINE_OUT) {
      return thickness * row.displayCount;
    } else {
      return width;
    }
  };

  const calculateMaxDisplayCount = (row: ShelfCalculatorRow) => {
    const book = booksMap.get(row.bookTitle)!;
    const thickness = book.thickness ?? DEFAULT_THICKNESS;

    if (row.displayMode == DisplayMode.SPINE_OUT) {
      return row.stock;
    } else {
      const maxBooksThatFit = Math.floor(SHELF_DEPTH / thickness);
      return Math.min(maxBooksThatFit, row.stock);
    }
  };

  const calculateCurrentDisplayCount = (row: ShelfCalculatorRow) => {
    const book = booksMap.get(row.bookTitle)!;
    const thickness = book.thickness ?? DEFAULT_THICKNESS;

    if (row.displayMode == DisplayMode.SPINE_OUT) {
      return Math.min(row.stock, row.displayCount);
    } else {
      const maxBooksThatFit = Math.floor(SHELF_DEPTH / thickness);
      // We take the minimum of the stock of this book, the currently selected
      // display count, and the maximum number of books that can fit on the shelf
      return Math.min(maxBooksThatFit, row.stock, row.displayCount);
    }
  };

  // Handlers for when data is changed
  const handleBookChange = (
    rowData: ShelfCalculatorRow,
    newBookTitle: string
  ) => {
    setRows((draft) => {
      const row = findById(draft, rowData.id)!;
      const book = booksMap.get(newBookTitle)!;

      row.bookTitle = formatBookForDropdown(book.title, book.isbn13);
      row.stock = book.stock;
      row.hasUnknownDimensions = !book.thickness;
      row.maxDisplayCount = calculateMaxDisplayCount(row);
      row.displayCount = calculateMaxDisplayCount(row);
      row.shelfSpace = calculateShelfSpace(row);
      updateTotalShelfSpace(draft);
    });
  };

  const handleDisplayCountChange = (
    rowData: ShelfCalculatorRow,
    newDisplayCount: number
  ) => {
    setRows((draft) => {
      const row = findById(draft, rowData.id)!;
      row.displayCount = newDisplayCount;
      row.shelfSpace = calculateShelfSpace(row);
      updateTotalShelfSpace(draft);
    });
  };

  const handleDisplayModeChange = (
    rowData: ShelfCalculatorRow,
    newDisplayMode: DisplayMode
  ) => {
    setRows((draft) => {
      const row = findById(draft, rowData.id)!;
      row.displayMode = newDisplayMode;
      row.maxDisplayCount = calculateMaxDisplayCount(row);
      row.displayCount = calculateCurrentDisplayCount(row);
      row.shelfSpace = calculateShelfSpace(row);
      updateTotalShelfSpace(draft);
    });
  };

  const updateTotalShelfSpace = (rows: ShelfCalculatorRow[]) => {
    const total = rows.reduce((total, item) => total + item.shelfSpace, 0);
    setTotalShelfSpace(total);
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

  // The navigator to switch pages
  const navigate = useNavigate();

  const backButton = (
    <div className="flex col-1">
      <BackButton onClick={() => navigate("/books")} className="ml-1" />
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
          right={`Total Shelf Space: ${totalShelfSpace}`}
        />
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
            header={"Delete"}
            exportable={false}
            style={{ width: "10%" }}
          ></Column>
        </DataTable>
      </div>
    </div>
  );
}
