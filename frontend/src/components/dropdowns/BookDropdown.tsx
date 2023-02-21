import { Dropdown } from "primereact/dropdown";
import { createContext, useEffect, useState } from "react";
import { BOOKS_API } from "../../apis/BooksAPI";

export interface BookDropdownDataProps {
  setBooksMap: (arg0: Map<string, number>) => void; // Setter for book map
  setBookTitlesList: (arg0: string[]) => void; // Setter for book title list
}

export interface BookDropdownProps {
  setSelectedBook: (arg0: string) => void; // Set the selected book
  bookTitlesList: string[]; // List of book titles
  selectedBook: string; // The selected book
}

export function BooksDropdownData(props: BookDropdownDataProps) {
  BOOKS_API.getBooksNoPagination().then((response) => {
    const tempBookMap = new Map<string, number>();
    for (const book of response) {
      tempBookMap.set(book.title, book.id);
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
      appendTo={"self"}
      placeholder="Select a Book"
      onChange={(e) => props.setSelectedBook(e.value)}
      showClear
      virtualScrollerOptions={{ itemSize: 35 }}
      style={{ position: "absolute", zIndex: 9999 }}
    />
  );
}
