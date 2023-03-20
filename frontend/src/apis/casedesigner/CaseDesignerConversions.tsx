import { Shelf } from "../../pages/casedesigner/BookcaseList";
import { externalToInternalDate } from "../../util/DateOps";
import { APIBookcase, APIShelf } from "./CaseDesignerAPI";

export function APIToInternalBookcaseConversion(bookcase: APIBookcase) {
  return {
    id: bookcase.id.toString(),
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
    displayedBooks: shelf.displayed_books.map((displayedBook) => {
      return {
        bookId: displayedBook.book.toString(),
        bookISBN: displayedBook.book_isbn!,
        bookTitle: displayedBook.book_title!,
        displayMode: displayedBook.display_mode,
        displayCount: displayedBook.display_count,
      };
    }),
  };
}
