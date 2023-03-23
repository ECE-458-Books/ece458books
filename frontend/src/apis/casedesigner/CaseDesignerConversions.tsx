import { v4 as uuid } from "uuid";
import { Bookcase, Shelf } from "../../pages/casedesigner/BookcaseList";
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
  return {
    id: uuid(),
    displayedBooks: shelf.displayed_books.map((displayedBook) => {
      return {
        id: uuid(),
        bookId: displayedBook.book.toString(),
        bookISBN: displayedBook.book_isbn!,
        bookTitle: displayedBook.book_title!,
        bookImageURL: displayedBook.book_url!,
        displayMode: displayedBook.display_mode,
        displayCount: displayedBook.display_count,
      };
    }),
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
