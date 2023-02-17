import { Dropdown } from "primereact/dropdown";
import { useEffect, useState } from "react";
import { BOOKS_API } from "../../apis/BooksAPI";

// options.value
//(e) => {
//   options.editorCallback?.(e.target.value);
//}

export interface BookDropdownProps {
  setBookMap: (arg0: Map<string, number>) => void; // Setter for book map
  setSelectedBook: (arg0: string) => void; // Set the selected book
  selectedBook: string; // The selected book
}

// This can only be used in a table cell
export default function BookDropdown(props: BookDropdownProps) {
  const [bookTitlesList, setBookTitlesList] = useState<string[]>([]);

  useEffect(() => {
    BOOKS_API.getBooksNoPagination().then((response) => {
      const tempBookMap = new Map<string, number>();
      for (const book of response) {
        tempBookMap.set(book.title, book.id);
      }
      props.setBookMap(tempBookMap);
      setBookTitlesList(response.map((book) => book.title));
    });
  }, []);

  return (
    <Dropdown
      value={props.selectedBook}
      options={bookTitlesList}
      filter
      appendTo={"self"}
      placeholder="Select a Book"
      onChange={(e) => props.setSelectedBook(e.value)}
      showClear
      virtualScrollerOptions={{ itemSize: 35 }}
      style={{ position: "absolute", zIndex: 9999 }}
    />
  );
}
