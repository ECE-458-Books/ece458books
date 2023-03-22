import { RefObject, useState } from "react";
import { OverlayPanel } from "primereact/overlaypanel";
import BooksDropdown from "../../../components/dropdowns/BookDropdown";
import DisplayModeDropdown, {
  DisplayMode,
} from "../../../components/dropdowns/DisplayModeDropdown";
import { NumberEditor } from "../../../components/editors/NumberEditor";
import { DisplayBook } from "../BookcaseList";
import { Button } from "primereact/button";
import { Book } from "../../books/BookList";
import { v4 as uuid } from "uuid";

export interface AddBookPopoverProps {
  booksDropdownTitles: string[];
  booksMap: Map<string, Book>;
  panelRef: RefObject<OverlayPanel>;
  addBookToShelf: (book: DisplayBook) => void;
}

export default function AddBookPopover(props: AddBookPopoverProps) {
  const [selectedBookTitle, setSelectedBookTitle] = useState<string>("");
  const [selectedDisplayMode, setSelectedDisplayMode] = useState<DisplayMode>(
    DisplayMode.SPINE_OUT
  );
  const [selectedDisplayCount, setSelectedDisplayCount] = useState<number>(1);

  return (
    <OverlayPanel ref={props.panelRef}>
      <BooksDropdown
        setSelectedBook={setSelectedBookTitle}
        selectedBook={selectedBookTitle}
        bookTitlesList={props.booksDropdownTitles}
        placeholder={"Select a book"}
      />
      <DisplayModeDropdown
        setSelectedDisplayMode={setSelectedDisplayMode}
        selectedDisplayMode={selectedDisplayMode}
      />
      {NumberEditor(selectedDisplayCount, setSelectedDisplayCount)}
      <Button
        type="button"
        label={"Add Book"}
        icon="pi pi-plus"
        onClick={(e) => {
          const book = props.booksMap.get(selectedBookTitle)!;
          props.addBookToShelf({
            id: uuid(),
            bookId: book.id,
            bookISBN: book.isbn13,
            bookTitle: selectedBookTitle,
            bookImageURL: book.thumbnailURL,
            displayMode: selectedDisplayMode,
            displayCount: selectedDisplayCount,
          });
          props.panelRef.current!.toggle(e);
        }}
        iconPos="right"
        className={"p-button-sm"}
      />
    </OverlayPanel>
  );
}
