import { Book } from "../pages/books/BookList";
import { DEFAULT_THICKNESS } from "../pages/casedesigner/util/Calculations";

export function roundToTwoDecimalPlaces(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function calculateDaysOfSupply(book: Book): number | "(inf)" {
  if (book.stock === 0) {
    return "(inf)";
  } else {
    return Math.floor((book.stock / book.lastMonthSales!) * 30);
  }
}

export function updateShelfSpace(thickness: number | undefined, stock: number) {
  const calcThickness = thickness ? thickness : DEFAULT_THICKNESS;
  return Math.round((calcThickness * stock + Number.EPSILON) * 100) / 100;
}
