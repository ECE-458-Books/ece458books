import { Dropdown } from "primereact/dropdown";
import { BOOKS_API } from "../../apis/BooksAPI";
import { APIToInternalBookConversion } from "../../apis/Conversions";
import { Book } from "../../pages/list/BookList";

export interface BookDropdownDataProps {
  setBooksMap: (arg0: Map<string, Book>) => void; // Setter for book map
  setBookTitlesList: (arg0: string[]) => void; // Setter for book title list
}

export interface BookDropdownProps {
  setSelectedBook: (arg0: string) => void; // Set the selected book
  bookTitlesList: string[]; // List of book titles
  selectedBook: string; // The selected book
  placeholder?: string; // Placeholder for the dropdown
  refreshKey?: number; // Used for refreshing the dropdown, necessary for a workaround
}

export function BooksDropdownData(props: BookDropdownDataProps) {
  BOOKS_API.getBooksNoPagination().then((response) => {
    const tempBookMap = new Map<string, Book>();
    for (const book of response) {
      const convertedBook = APIToInternalBookConversion(book);
      tempBookMap.set(book.title, convertedBook);
    }
    props.setBooksMap(tempBookMap);
    props.setBookTitlesList(response.map((book) => book.title));
  });
}

// This can only be used in a table cell
export default function BooksDropdown(props: BookDropdownProps) {
  return (
    <Dropdown
      autoFocus
      value={props.selectedBook}
      options={props.bookTitlesList}
      filter
      appendTo={document.body}
      placeholder={props.placeholder ?? "Select a book"}
      onChange={(e) => {
        props.setSelectedBook(e.value);
      }}
      key={props.refreshKey}
      showClear
      virtualScrollerOptions={{ itemSize: 35 }}
      style={{
        minWidth: "30rem",
        maxWidth: "30rem",
      }}
    />
  );
}
