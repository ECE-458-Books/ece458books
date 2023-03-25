import { DataTable } from "primereact/datatable";
import DeleteColumn from "../../../components/datatable/DeleteColumn";
import {
  createColumns,
  TableColumn,
} from "../../../components/datatable/TableColumns";
import { BooksDropdownData } from "../../../components/dropdowns/BookDropdown";
import { filterById } from "../../../util/IDOps";
import { Bookcase, DisplayBook, Shelf } from "../BookcaseList";
import { Column } from "primereact/column";
import { DragAndDropContext, ShelfWithBookImages } from "./DnDComponents";
import { useEffect, useState } from "react";
import { Updater, useImmer } from "use-immer";
import { Button } from "primereact/button";
import { Book } from "../../books/BookList";
import AddEditDeleteDisplayBookPopup from "./AddBookPopover";
import { DisplayMode } from "../../../components/dropdowns/DisplayModeDropdown";
import { findShelf } from "./DndFunctions";
import { v4 as uuid } from "uuid";
import AlteredTextTemplate from "../../../components/templates/AlteredTextTemplate";
import {
  calculateMaxDisplayCount,
  calculateSingleBookShelfSpace,
  calculateTotalShelfSpace,
} from "../util/Calculations";

interface BookcaseDetailTableProps {
  shelves: Shelf[]; // The array of shelves
  setBookcase: Updater<Bookcase>; // Update the bookcase
  isAddPage: boolean; // True if this is an add page
  isModifiable: boolean; // True if this page is modifiable
  shelfWidth: number; // Width of the shelves
  tableHeader?: JSX.Element; // add buttons and functionality to attached element of table on the top
}

const emptyDisplayBook: DisplayBook = {
  id: "",
  bookId: "",
  bookTitle: "",
  bookISBN: "",
  bookImageURL: "",
  displayMode: DisplayMode.SPINE_OUT,
  displayCount: 1,
  maxDisplayCount: 1,
  stock: 1,
  shelfSpace: 0,
  hasUnknownDimensions: false,
};

export default function BookcaseDetailTable(props: BookcaseDetailTableProps) {
  const [booksMap, setBooksMap] = useState<Map<string, Book>>(new Map());
  const [bookTitlesList, setBookTitlesList] = useState<string[]>([]);
  const [currentAddBookShelfId, setCurrentAddBookShelfId] =
    useState<string>("");
  const [currentlySelectedBook, setCurrentlySelectedBook] =
    useImmer<DisplayBook>(emptyDisplayBook);
  const [isBookPopupVisible, setIsBookPopupVisible] = useState<boolean>(false);

  const COLUMNS: TableColumn<Shelf>[] = [
    {
      field: "displayedBooks",
      header: "Displayed Books",
      customBody: (rowData: Shelf) => {
        return (
          <ShelfWithBookImages
            shelf={rowData}
            setSelectedBook={setCurrentlySelectedBook}
            setIsBookPopupVisible={setIsBookPopupVisible}
            isModifiable={props.isModifiable}
          />
        );
      },
    },
    {
      field: "shelfSpace",
      header: "Shelf Space (in)",
      customBody: (rowData: Shelf) =>
        AlteredTextTemplate(
          rowData.shelfSpace > props.shelfWidth ? "font-bold" : "",
          Math.round(rowData.shelfSpace * 100) / 100
        ),
      style: { width: "5rem", padding: "2" },
    },
    {
      field: "none",
      header: "Add Book",
      hidden: !props.isModifiable,
      customBody: (rowData: Shelf) => addBookButton(rowData),
      style: { width: "3rem", padding: "2" },
    },
  ];

  const createNewDisplayBook = (): DisplayBook => {
    const selectedBook = booksMap.get(currentlySelectedBook.bookTitle)!;

    return {
      id: uuid(),
      bookId: selectedBook.id,
      bookTitle: currentlySelectedBook.bookTitle,
      bookISBN: selectedBook.isbn13,
      bookImageURL: selectedBook.thumbnailURL,
      displayMode: currentlySelectedBook.displayMode,
      displayCount: currentlySelectedBook.displayCount,
      stock: selectedBook.stock,
      maxDisplayCount: calculateMaxDisplayCount(
        currentlySelectedBook.displayMode,
        selectedBook.thickness
      ),
      hasUnknownDimensions: !selectedBook.thickness,
      shelfSpace: calculateSingleBookShelfSpace(
        currentlySelectedBook.displayMode,
        currentlySelectedBook.displayCount,
        selectedBook.thickness,
        selectedBook.width
      ),
    };
  };

  const addBookToCurrentShelf = () => {
    props.setBookcase((draft) => {
      const shelf = findShelf(draft.shelves, currentAddBookShelfId)!;
      shelf.displayedBooks.push(createNewDisplayBook());
    });
    computeShelfSpaceForAllShelves();
  };

  const editBookOnCurrentShelf = () => {
    props.setBookcase((draft) => {
      const shelf = findShelf(draft.shelves, currentlySelectedBook.id)!;
      const bookIndex = shelf.displayedBooks.findIndex(
        (draftBook) => draftBook.id === currentlySelectedBook.id
      );
      shelf.displayedBooks[bookIndex] = createNewDisplayBook();
    });
    computeShelfSpaceForAllShelves();
  };

  const deleteBookFromCurrentShelf = () => {
    props.setBookcase((draft) => {
      const shelf = findShelf(draft.shelves, currentlySelectedBook.id)!;
      const bookIndex = shelf.displayedBooks.findIndex(
        (draftBook) => draftBook.id === currentlySelectedBook.id
      );
      shelf.displayedBooks.splice(bookIndex, 1);
    });
    setCurrentlySelectedBook(emptyDisplayBook);
    computeShelfSpaceForAllShelves();
  };

  const computeShelfSpaceForAllShelves = () => {
    props.setBookcase((draft) => {
      draft.shelves.forEach((shelf) => {
        shelf.shelfSpace = calculateTotalShelfSpace(shelf.displayedBooks);
      });
    });
  };

  // Get the data for the books dropdown
  useEffect(
    () =>
      BooksDropdownData({
        setBooksMap: setBooksMap,
        setBookTitlesList: setBookTitlesList,
      }),
    []
  );

  // -------- VISUAL COMPONENTS --------

  // Delete icon for each row
  const deleteColumn = DeleteColumn<Shelf>({
    onDelete: (rowData) => {
      filterById(props.shelves, rowData.id!, setShelves);
    },
    hidden: !props.isModifiable,
  });

  const addBookButton = (rowData: Shelf) => {
    return (
      <div className="flex justify-content-center">
        <Button
          icon="pi pi-plus"
          className="p-button-rounded"
          style={{ height: 40, width: 40 }}
          onClick={(e) => {
            setIsBookPopupVisible(true);
            setCurrentlySelectedBook(emptyDisplayBook);
            setCurrentAddBookShelfId(rowData.id);
            e.preventDefault();
          }}
        />
      </div>
    );
  };

  const columns = createColumns(COLUMNS);

  // The popover for adding books
  const addBookPopover = (
    <AddEditDeleteDisplayBookPopup
      booksDropdownTitles={bookTitlesList}
      booksMap={booksMap}
      isVisible={isBookPopupVisible}
      setIsVisible={setIsBookPopupVisible}
      addBookToShelf={addBookToCurrentShelf}
      editBookOnShelf={editBookOnCurrentShelf}
      deleteBookFromShelf={deleteBookFromCurrentShelf}
      selectedDisplayBook={currentlySelectedBook}
      setSelectedDisplayBook={setCurrentlySelectedBook}
      isAddPopup={currentlySelectedBook.id === ""}
    />
  );

  // -------- DRAG AND DROP --------

  const setShelves = (shelves: Shelf[]) => {
    props.setBookcase((draft) => {
      draft.shelves = shelves;
    });
  };

  return (
    <DragAndDropContext
      shelves={props.shelves}
      setBookcase={props.setBookcase}
      isModifiable={props.isModifiable}
    >
      <DataTable
        showGridlines
        header={props.tableHeader}
        value={props.shelves}
        className="editable-cells-table"
        responsiveLayout="scroll"
        reorderableRows={props.isModifiable}
        onRowReorder={(e) => {
          // I think something is wrong with the PrimeReact library, because
          // the code in the demo works, but TypeScript complains about it
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          setShelves(e.value);
        }}
      >
        {props.isModifiable && <Column rowReorder style={{ width: "3rem" }} />}
        {columns}
        {deleteColumn}
      </DataTable>
      {addBookPopover}
    </DragAndDropContext>
  );
}
