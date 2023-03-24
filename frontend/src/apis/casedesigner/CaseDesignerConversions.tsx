import { v4 as uuid } from "uuid";
import { formatBookForDropdown } from "../../components/dropdowns/BookDropdown";
import {
  Bookcase,
  DisplayBook,
  Shelf,
} from "../../pages/casedesigner/BookcaseList";
import {
  calculateMaxDisplayCount,
  calculateSingleBookShelfSpace,
  calculateTotalShelfSpace,
} from "../../pages/casedesigner/util/Calculations";
import { APIBookcase, APIShelf } from "./CaseDesignerAPI";

export function APIToInternalBookcaseConversion(bookcase: APIBookcase) {
  return {
    id: bookcase.id!.toString(),
    name: bookcase.name,
    width: bookcase.width,
    creator: bookcase.creator_username!,
    lastEditDate: new Date(bookcase.last_edit_date!),
    lastEditor: bookcase.last_editor_username!,
    shelves: bookcase.shelves.map((shelf) => {
      return APIToInternalShelfConversion(shelf);
    }),
  };
}

export function APIToInternalShelfConversion(shelf: APIShelf): Shelf {
  const displayedBooks: DisplayBook[] = shelf.displayed_books.map(
    (displayedBook) => {
      return {
        id: uuid(),
        bookId: displayedBook.book.toString(),
        bookISBN: displayedBook.book_isbn!,
        bookTitle: formatBookForDropdown(
          displayedBook.book_title!,
          displayedBook.book_isbn!
        ),
        bookImageURL: displayedBook.book_url!,
        displayMode: displayedBook.display_mode,
        displayCount: displayedBook.display_count,
        stock: displayedBook.book_stock!,
        hasUnknownDimensions: !displayedBook.book_thickness,
        maxDisplayCount: calculateMaxDisplayCount(
          displayedBook.display_mode,
          displayedBook.book_thickness
        ),
        shelfSpace: calculateSingleBookShelfSpace(
          displayedBook.display_mode,
          displayedBook.display_count,
          displayedBook.book_thickness,
          displayedBook.book_width
        ),
      };
    }
  );

  return {
    id: uuid(),
    displayedBooks: displayedBooks,
    shelfSpace: calculateTotalShelfSpace(displayedBooks),
  };
}

export function InternalToAPIBookcaseConversion(bookcase: Bookcase) {
  return {
    id: Number(bookcase.id),
    name: bookcase.name,
    width: bookcase.width,
    shelves: bookcase.shelves.map((shelf) => {
      return InternalToAPIShelfConversion(shelf);
    }),
  };
}

export function InternalToAPIShelfConversion(shelf: Shelf): APIShelf {
  return {
    displayed_books: shelf.displayedBooks.map((displayedBook) => {
      return {
        book: Number(displayedBook.bookId),
        display_mode: displayedBook.displayMode,
        display_count: displayedBook.displayCount,
      };
    }),
  };
}
