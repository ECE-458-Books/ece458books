import { DisplayMode } from "../../../components/dropdowns/DisplayModeDropdown";
import { Book } from "../../books/BookList";
import { DisplayBook } from "../BookcaseList";

const DEFAULT_WIDTH = 5;
// const DEFAULT_HEIGHT = 8 Unused for now, but if needed later, uncomment
export const DEFAULT_THICKNESS = 0.8;
const SHELF_DEPTH = 8;

export function calculateSingleBookShelfSpace(
  displayMode: DisplayMode,
  displayCount: number,
  thickness?: number,
  width?: number
) {
  const calcWidth = width ?? DEFAULT_WIDTH;
  const calcThickness = thickness ?? DEFAULT_THICKNESS;

  if (displayMode == DisplayMode.SPINE_OUT) {
    return calcThickness * displayCount;
  } else {
    return displayCount == 0 ? 0 : calcWidth;
  }
}

// If spine out, then the max display count is infinite.
export function calculateMaxDisplayCount(
  displayMode: DisplayMode,
  thickness?: number
) {
  const calcThickness = thickness ?? DEFAULT_THICKNESS;

  if (displayMode == DisplayMode.SPINE_OUT) {
    return undefined;
  } else {
    const maxBooksThatFit = Math.floor(SHELF_DEPTH / calcThickness);
    return maxBooksThatFit;
  }
}

export function calculateCurrentDisplayCountOnModeChange(
  booksMap: Map<string, Book>,
  row: DisplayBook
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
  row: DisplayBook
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

export function calculateTotalShelfSpace(rows: DisplayBook[]) {
  const total = rows.reduce((total, item) => total + item.shelfSpace, 0);
  return Math.round(total * 100) / 100;
}
