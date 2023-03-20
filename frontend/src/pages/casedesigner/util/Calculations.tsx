import { DisplayMode } from "../../../components/dropdowns/DisplayModeDropdown";
import { Book } from "../../books/BookList";
import { ShelfCalculatorRow } from "../ShelfCalculator";

const DEFAULT_WIDTH = 5;
// const DEFAULT_HEIGHT = 8 Unused for now, but if needed later, uncomment
export const DEFAULT_THICKNESS = 0.8;
const SHELF_DEPTH = 8;

export function calculateShelfSpace(
  booksMap: Map<string, Book>,
  row: ShelfCalculatorRow
) {
  const book = booksMap.get(row.bookTitle)!;
  const width = book.width ?? DEFAULT_WIDTH;
  const thickness = book.thickness ?? DEFAULT_THICKNESS;

  if (row.displayMode == DisplayMode.SPINE_OUT) {
    return thickness * row.displayCount;
  } else {
    return width;
  }
}

// If spine out, then the max display count is infinite.
export function calculateMaxDisplayCount(
  booksMap: Map<string, Book>,
  row: ShelfCalculatorRow
) {
  const book = booksMap.get(row.bookTitle)!;
  const thickness = book.thickness ?? DEFAULT_THICKNESS;

  if (row.displayMode == DisplayMode.SPINE_OUT) {
    return undefined;
  } else {
    const maxBooksThatFit = Math.floor(SHELF_DEPTH / thickness);
    return maxBooksThatFit;
  }
}

export function calculateCurrentDisplayCountOnModeChange(
  booksMap: Map<string, Book>,
  row: ShelfCalculatorRow
) {
  const book = booksMap.get(row.bookTitle)!;
  const thickness = book.thickness ?? DEFAULT_THICKNESS;

  if (row.displayMode == DisplayMode.SPINE_OUT) {
    return Math.min(row.stock, row.displayCount);
  } else {
    const maxBooksThatFit = Math.floor(SHELF_DEPTH / thickness);
    return Math.min(maxBooksThatFit, row.displayCount);
  }
}

export function calculateCurrentDisplayCountOnBookChange(
  booksMap: Map<string, Book>,
  row: ShelfCalculatorRow
) {
  const book = booksMap.get(row.bookTitle)!;
  const thickness = book.thickness ?? DEFAULT_THICKNESS;

  if (row.displayMode == DisplayMode.SPINE_OUT) {
    return row.stock;
  } else {
    const maxBooksThatFit = Math.floor(SHELF_DEPTH / thickness);
    return Math.min(maxBooksThatFit, row.stock);
  }
}

export function calculateTotalShelfSpace(rows: ShelfCalculatorRow[]) {
  const total = rows.reduce((total, item) => total + item.shelfSpace, 0);
  return Math.round(total * 100) / 100;
}
