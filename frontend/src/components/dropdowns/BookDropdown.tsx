import { Dropdown } from "primereact/dropdown";
import { BOOKS_API } from "../../apis/books/BooksAPI";
import { APIToInternalBookConversion } from "../../apis/books/BooksConversions";
import { Book } from "../../pages/books/BookList";

export interface BookDropdownDataProps {
  setBooksMap: (arg0: Map<string, Book>) => void; // Setter for book map
  setBookTitlesList: (arg0: string[]) => void; // Setter for book title list
  vendor?: number; // set vendor who books were bought from
}

export interface BookDropdownProps {
  setSelectedBook: (arg0: string) => void; // Set the selected book
  bookTitlesList: string[]; // List of book titles
  selectedBook: string; // The selected book
  placeholder?: string; // Placeholder for the dropdown
  isDisabled?: boolean; //Disable the editor or not
}

export function formatBookForDropdown(title: string, isbn: string | number) {
  return `${title} (ISBN13 - ${isbn})`;
}

export function BooksDropdownData(props: BookDropdownDataProps) {
  BOOKS_API.getBooksNoPagination(props.vendor).then((response) => {
    const tempBookMap = new Map<string, Book>();
    for (const book of response) {
      const convertedBook = APIToInternalBookConversion(book);
      tempBookMap.set(
        formatBookForDropdown(book.title, book.isbn_13),
        convertedBook
      );
    }
    props.setBooksMap(tempBookMap);
    props.setBookTitlesList(
      response.map((book) => formatBookForDropdown(book.title, book.isbn_13))
    );
  });
}

// This can only be used in a table cell
export default function BooksDropdown(props: BookDropdownProps) {
  return (
    <Dropdown
      value={props.selectedBook}
      options={props.bookTitlesList}
      filter
      disabled={props.isDisabled}
      placeholder={props.placeholder ?? "Select a book"}
      onChange={(e) => {
        props.setSelectedBook(e.value);
      }}
      style={{
        width: "30rem",
      }}
    />
  );
}
