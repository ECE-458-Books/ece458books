import { Dispatch, SetStateAction } from "react";
import { Updater } from "use-immer";
import { formatBookForDropdown } from "../../../components/dropdowns/BookDropdown";
import { DisplayMode } from "../../../components/dropdowns/DisplayModeDropdown";
import { findById } from "../../../util/IDOps";
import { Book } from "../../books/BookList";
import { ShelfCalculatorRow } from "../ShelfCalculator";
import {
  calculateCurrentDisplayCountOnBookChange,
  calculateCurrentDisplayCountOnModeChange,
  calculateMaxDisplayCount,
  calculateShelfSpace,
  calculateTotalShelfSpace,
} from "./Calculations";

export function updateRowOnBookChange(
  setRows: Updater<ShelfCalculatorRow[]>,
  setTotalShelfSpace: Dispatch<SetStateAction<number>>,
  rowData: ShelfCalculatorRow,
  newBookTitle: string,
  booksMap: Map<string, Book>
) {
  setRows((draft) => {
    const row = findById(draft, rowData.id)!;
    const book = booksMap.get(newBookTitle)!;

    row.bookTitle = formatBookForDropdown(book.title, book.isbn13);
    row.stock = book.stock;
    row.hasUnknownDimensions = !book.thickness;
    row.maxDisplayCount = calculateMaxDisplayCount(booksMap, row);
    row.displayCount = calculateCurrentDisplayCountOnBookChange(booksMap, row);
    row.shelfSpace = calculateShelfSpace(booksMap, row);
    setTotalShelfSpace(calculateTotalShelfSpace(draft));
  });
}

export function updateRowOnDisplayModeChange(
  setRows: Updater<ShelfCalculatorRow[]>,
  setTotalShelfSpace: Dispatch<SetStateAction<number>>,
  rowData: ShelfCalculatorRow,
  newDisplayMode: DisplayMode,
  booksMap: Map<string, Book>
) {
  setRows((draft) => {
    const row = findById(draft, rowData.id)!;
    row.displayMode = newDisplayMode;
    row.maxDisplayCount = calculateMaxDisplayCount(booksMap, row);
    row.displayCount = calculateCurrentDisplayCountOnModeChange(booksMap, row);
    row.shelfSpace = calculateShelfSpace(booksMap, row);
    setTotalShelfSpace(calculateTotalShelfSpace(draft));
  });
}

export function updateRowOnDisplayCountChange(
  setRows: Updater<ShelfCalculatorRow[]>,
  setTotalShelfSpace: Dispatch<SetStateAction<number>>,
  rowData: ShelfCalculatorRow,
  newDisplayCount: number,
  booksMap: Map<string, Book>
) {
  setRows((draft) => {
    const row = findById(draft, rowData.id)!;
    row.displayCount = newDisplayCount;
    row.shelfSpace = calculateShelfSpace(booksMap, row);
    setTotalShelfSpace(calculateTotalShelfSpace(draft));
  });
}
