import { Dropdown } from "primereact/dropdown";
import { BOOKS_API } from "../../apis/BooksAPI";
import { APIToInternalBookConversion } from "../../apis/Conversions";
import { Book } from "../../pages/list/BookList";

export interface BookDropdownDataBBRestrictedProps {
  setBooksMap: (arg0: Map<string, Book>) => void; // Setter for book map
  setBookTitlesList: (arg0: string[]) => void; // Setter for book title list
  vendorName: number; // Setter for name of vendor
}

export interface BookDropdownBBRestrictedProps {
  setSelectedBook: (arg0: string) => void; // Set the selected book
  bookTitlesList: string[]; // List of book titles
  selectedBook: string; // The selected book
  placeholder?: string; // Placeholder for the dropdown
}

export function BooksDropdownBBRestrictedData(
  props: BookDropdownDataBBRestrictedProps
) {
  BOOKS_API.getBooksNoPaginationBuyBackRestricted(props.vendorName).then(
    (response) => {
      const tempBookMap = new Map<string, Book>();
      for (const book of response) {
        const convertedBook = APIToInternalBookConversion(book);
        tempBookMap.set(book.title, convertedBook);
      }
      props.setBooksMap(tempBookMap);
      props.setBookTitlesList(response.map((book) => book.title));
    }
  );
}

// This can only be used in a table cell
export default function BooksDropdownBBRestricted(
  props: BookDropdownBBRestrictedProps
) {
  return (
    <Dropdown
      value={props.selectedBook}
      options={props.bookTitlesList}
      filter
      placeholder={props.placeholder ?? "Select a book"}
      onChange={(e) => {
        props.setSelectedBook(e.value);
      }}
      showClear
      style={{
        width: "30rem",
      }}
    />
  );
}
