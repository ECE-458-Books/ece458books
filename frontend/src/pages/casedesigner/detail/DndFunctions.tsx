import { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Updater } from "use-immer";
import { filterById } from "../../../util/IDOps";
import { Bookcase, DisplayBook, Shelf } from "../BookcaseList";

export function findShelf(shelves: Shelf[], shelfOrBookId: string) {
  // If book is dragged to an empty shelf, the shelf ID is given
  const emptyShelf = shelves.find((shelf) => shelf.id === shelfOrBookId);
  if (emptyShelf) return emptyShelf;

  // Otherwise we find the id of the book that the book is being dragged to
  return shelves.find((shelf) => {
    return shelf.displayedBooks.some((book) => book.id === shelfOrBookId);
  });
}

// Updates state when the dragging action begins
export function onDragStart(
  event: DragStartEvent,
  shelves: Shelf[],
  setCurrentlyDraggedBook: (book: DisplayBook | undefined) => void
) {
  const draggedBookId = event.active.id as string;
  const shelf = findShelf(shelves, draggedBookId);
  const draggedBook = shelf?.displayedBooks.find(
    (book) => book.bookId === draggedBookId
  );
  setCurrentlyDraggedBook(draggedBook);
}

// This function only does something when the book is dragged to a new shelf
// When a book is dragged to the same shelf, the animation is taken care of by
// DragOverlay, and the actual update to state occurs in onDragEnd
export function onDragOver(
  event: DragOverEvent,
  setBookcase: Updater<Bookcase>
) {
  const draggedId = event.active.id as string;
  const overId = event.over?.id as string; // can be another book, or the shelf container

  setBookcase((draft) => {
    const previousShelf = findShelf(draft.shelves, draggedId);
    const newShelf = findShelf(draft.shelves, overId);

    if (!newShelf || !previousShelf || previousShelf === newShelf) return;

    const previousShelfIndex = previousShelf.displayedBooks.findIndex(
      (book) => book.id === draggedId
    );
    const newShelfIndex = newShelf.displayedBooks.findIndex(
      (book) => book.id === overId
    );

    const draggedBook = previousShelf.displayedBooks[previousShelfIndex];

    previousShelf.displayedBooks = filterById(
      previousShelf.displayedBooks,
      draggedId
    );

    newShelf.displayedBooks.splice(newShelfIndex, 0, draggedBook);
  });
}

// This function only does something when the book is dragged to the same shelf
// When a book is dragged to a new shelf, the update to state occurs in onDragOver
export function onDragEnd(
  event: DragEndEvent,
  setBookcase: Updater<Bookcase>,
  setCurrentlyDraggedBook: (book: DisplayBook | undefined) => void
) {
  const draggedId = event.active.id as string;
  const overId = event.over?.id as string; // can be another book, or the shelf container

  setBookcase((draft) => {
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
}
