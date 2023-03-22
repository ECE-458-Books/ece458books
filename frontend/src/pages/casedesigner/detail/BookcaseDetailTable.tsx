import { DataTable } from "primereact/datatable";
import DeleteColumn from "../../../components/datatable/DeleteColumn";
import {
  createColumns,
  TableColumn,
} from "../../../components/datatable/TableColumns";
import BooksDropdown from "../../../components/dropdowns/BookDropdown";
import { filterById, findById } from "../../../util/IDOps";
import { Bookcase, DisplayBook, Shelf } from "../BookcaseList";
import { Column } from "primereact/column";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { DraggableBook, ShelfWithBookImages } from "./DragAndDrop";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useState } from "react";
import { Updater } from "use-immer";
import { current } from "immer";
import { logger } from "../../../util/Logger";

interface BookcaseDetailTableProps {
  shelves: Shelf[]; // The array of shelves
  setBookcase: Updater<Bookcase>; // Update the bookcase
  isAddPage: boolean; // True if this is an add page
  isModifiable: boolean; // True if this page is modifiable
  booksDropdownTitles: string[]; // The list of books for the books dropdown
  tableHeader?: JSX.Element; // add buttons and functionality to attached element of table on the top
}

export default function BookcaseDetailTable(props: BookcaseDetailTableProps) {
  const [currentlyDraggedBook, setCurrentlyDraggedBook] =
    useState<DisplayBook>();

  const COLUMNS: TableColumn<Shelf>[] = [
    {
      field: "displayedBooks",
      header: "Displayed Books",
      customBody: (rowData: Shelf) => {
        return <ShelfWithBookImages shelf={rowData} />;
      },
    },
  ];

  const setShelves = (shelves: Shelf[]) => {
    props.setBookcase((draft) => {
      draft.shelves = shelves;
    });
  };

  // Delete icon for each row
  const deleteColumn = DeleteColumn<Shelf>({
    onDelete: (rowData) => {
      filterById(props.shelves, rowData.id!, setShelves);
    },
    hidden: !props.isModifiable,
  });

  const columns = createColumns(COLUMNS);

  // -------- VISUAL COMPONENTS --------

  const booksDropDownEditor = (
    value: string,
    onChange: (newValue: string) => void,
    isDisabled?: boolean
  ) => (
    <BooksDropdown
      setSelectedBook={onChange}
      selectedBook={value}
      isDisabled={isDisabled}
      bookTitlesList={props.booksDropdownTitles}
      placeholder={value}
    />
  );

  // -------- DRAG AND DROP --------

  function findShelf(shelves: Shelf[], shelfOrBookId: string) {
    // If book is dragged to an empty shelf, the shelf ID is given
    const emptyShelf = shelves.find((shelf) => shelf.id === shelfOrBookId);
    if (emptyShelf) return emptyShelf;

    // Otherwise we find the id of the book that the book is being dragged to
    return shelves.find((shelf) => {
      return shelf.displayedBooks.some((book) => book.id === shelfOrBookId);
    });
  }

  function onDragStart(event: DragStartEvent) {
    const draggedBookId = event.active.id as string;
    const shelf = findShelf(props.shelves, draggedBookId);
    const draggedBook = shelf?.displayedBooks.find(
      (book) => book.bookId === draggedBookId
    );
    setCurrentlyDraggedBook(draggedBook);
  }

  // Only updates state when the shelf that the book is on actually changes
  function onDragOver(event: DragOverEvent) {
    const draggedId = event.active.id as string;
    const overId = event.over?.id as string;

    props.setBookcase((draft) => {
      const previousShelf = findShelf(draft.shelves, draggedId);
      const newShelf = findShelf(draft.shelves, overId);

      logger.debug("previousShelf", current(previousShelf));
      logger.debug("newShelf", current(newShelf));

      if (!newShelf || !previousShelf || previousShelf === newShelf) return;

      const previousShelfIndex = previousShelf.displayedBooks.findIndex(
        (book) => book.id === draggedId
      );
      const newShelfIndex = newShelf.displayedBooks.findIndex(
        (book) => book.id === overId
      );

      const draggedBook = previousShelf.displayedBooks[previousShelfIndex];

      logger.debug("draggedId", draggedId);
      logger.debug("overId", overId);

      logger.debug("previousShelfIndex", previousShelfIndex);
      logger.debug("newShelfIndex", newShelfIndex);
      logger.debug("draggedBook", current(draggedBook));

      previousShelf.displayedBooks = filterById(
        previousShelf.displayedBooks,
        draggedId
      );

      logger.debug("previousShelf", current(previousShelf));

      newShelf.displayedBooks.splice(newShelfIndex, 0, draggedBook);

      logger.debug("newShelf", current(newShelf));
    });
  }

  const onDragEnd = (event: DragEndEvent) => {
    const draggedId = event.active.id as string;
    const overId = event.over?.id as string;

    props.setBookcase((draft) => {
      const previousShelf = findShelf(draft.shelves, draggedId);
      const newShelf = findShelf(draft.shelves, overId);

      if (!newShelf || !previousShelf || previousShelf !== newShelf) return;

      const previousIndex = previousShelf.displayedBooks.findIndex(
        (book) => book.id === draggedId
      );
      const newIndex = newShelf.displayedBooks.findIndex(
        (book) => book.id === overId
      );

      previousShelf.displayedBooks = arrayMove(
        previousShelf.displayedBooks,
        previousIndex,
        newIndex
      );
    });

    setCurrentlyDraggedBook(undefined);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <DataTable
        showGridlines
        header={props.tableHeader}
        value={props.shelves}
        className="editable-cells-table"
        responsiveLayout="scroll"
        reorderableRows={true}
        onRowReorder={(e) => {
          // I think something is wrong with the PrimeReact library, because
          // the code in the demo works, but TypeScript complains about it
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          setShelves(e.value);
        }}
      >
        <Column rowReorder style={{ width: "3rem" }} />
        {columns}
        {deleteColumn}
        {/* ADD ROW COLUMN} */}
      </DataTable>
      <DragOverlay>
        {currentlyDraggedBook ? (
          <DraggableBook book={currentlyDraggedBook} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
