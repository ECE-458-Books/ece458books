import { formatBookForDropdown } from "../../../components/dropdowns/BookDropdown";
import { DisplayMode } from "../../../components/dropdowns/DisplayModeDropdown";
import { Book } from "../../books/BookList";
import { DisplayBook } from "../BookcaseList";
import {
  calculateCurrentDisplayCountOnBookChange,
  calculateCurrentDisplayCountOnModeChange,
  calculateMaxDisplayCount,
  calculateSingleBookShelfSpace,
} from "./Calculations";

export function updateDisplayBookOnTitleChange(
  setDisplayBook: (displayBook: DisplayBook) => void,
  displayBook: DisplayBook,
  newBookTitle: string,
  booksMap: Map<string, Book>
) {
  const newDisplayBook = { ...displayBook };
  const book = booksMap.get(newBookTitle)!;

  newDisplayBook.bookTitle = formatBookForDropdown(book.title, book.isbn13);
  newDisplayBook.stock = book.stock;
  newDisplayBook.hasUnknownDimensions = !book.thickness;
  newDisplayBook.maxDisplayCount = calculateMaxDisplayCount(
    newDisplayBook.displayMode,
    book.thickness
  );
  newDisplayBook.displayCount = calculateCurrentDisplayCountOnBookChange(
    booksMap,
    newDisplayBook
  );
  newDisplayBook.shelfSpace = calculateSingleBookShelfSpace(
    newDisplayBook.displayMode,
    newDisplayBook.displayCount,
    book.thickness,
    book.width
  );
  setDisplayBook(newDisplayBook);
}

export function updateDisplayBookOnModeChange(
  setDisplayBook: (displayBook: DisplayBook) => void,
  displayBook: DisplayBook,
  newDisplayMode: DisplayMode,
  booksMap: Map<string, Book>
) {
  const newDisplayBook = { ...displayBook };
  const book = booksMap.get(displayBook.bookTitle)!;

  newDisplayBook.displayMode = newDisplayMode;
  newDisplayBook.maxDisplayCount = calculateMaxDisplayCount(
    newDisplayBook.displayMode,
    book.thickness
  );
  console.log(newDisplayBook.maxDisplayCount);
  newDisplayBook.displayCount = calculateCurrentDisplayCountOnModeChange(
    booksMap,
    newDisplayBook
  );
  newDisplayBook.shelfSpace = calculateSingleBookShelfSpace(
    newDisplayBook.displayMode,
    newDisplayBook.displayCount,
    book.thickness,
    book.width
  );
  setDisplayBook(newDisplayBook);
}

export function updateDisplayBookOnCountChange(
  updateDisplayBook: (displayBook: DisplayBook) => void,
  displayBook: DisplayBook,
  newDisplayCount: number,
  booksMap: Map<string, Book>
) {
  const newDisplayBook = { ...displayBook };
  const book = booksMap.get(displayBook.bookTitle)!;

  newDisplayBook.displayCount = newDisplayCount;
  newDisplayBook.shelfSpace = calculateSingleBookShelfSpace(
    newDisplayBook.displayMode,
    newDisplayBook.displayCount,
    book.thickness,
    book.width
  );
  updateDisplayBook(newDisplayBook);
}
