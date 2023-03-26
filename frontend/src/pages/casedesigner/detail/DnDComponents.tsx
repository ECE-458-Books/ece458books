import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  MAX_IMAGE_HEIGHT,
  MAX_IMAGE_WIDTH,
} from "../../../components/editors/PriceEditor";
import { Image } from "primereact/image";
import { Bookcase, DisplayBook, Shelf } from "../BookcaseList";
import {
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { onDragEnd, onDragOver, onDragStart } from "./DndFunctions";
import { Updater } from "use-immer";
import { useState } from "react";
import { roundToTwoDecimalPlaces } from "../../../util/NumberOps";
import { Tooltip } from "primereact/tooltip";

// A droppable zone. The tag should be wrapped around the zone, and the id should be unique
export interface DroppableProps {
  id: string;
  children: React.ReactNode;
}

export function Droppable(props: DroppableProps) {
  const { setNodeRef } = useDroppable({
    id: props.id,
  });

  return (
    <div ref={setNodeRef} style={{ minHeight: MAX_IMAGE_HEIGHT }}>
      {props.children}
    </div>
  );
}

// A single sortable item. The tag should be wrapped around the item, and the id should be unique
export interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

export function SortableItem(props: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: props.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {props.children}
    </div>
  );
}

// A draggable book, which uses the sortable item above.
export interface DraggableBookProps {
  book: DisplayBook;
  // Only for the actual books, not the drag overlay UI element
  setSelectedBook?: Updater<DisplayBook>;
  setIsBookPopupVisible?: (isVisible: boolean) => void;
  isModifiable?: boolean;
}

export function DraggableBook(props: DraggableBookProps) {
  return (
    <SortableItem id={props.book.id} key={props.book.id}>
      <div className="pl-1">
        <div className="flex col-12 justify-content-start p-1">
          <Tooltip target=".custom-displaybook-tooltip" showDelay={700} />
          <Image
            src={props.book.bookImageURL}
            id={props.book.id}
            alt="Image"
            imageStyle={{
              objectFit: "contain",
              maxHeight: MAX_IMAGE_HEIGHT,
              maxWidth: MAX_IMAGE_WIDTH,
            }}
            className="flex justify-content-center custom-displaybook-tooltip"
            imageClassName="shadow-2 border-round"
            onClick={() => {
              if (
                !props.setSelectedBook ||
                !props.setIsBookPopupVisible ||
                !props.isModifiable
              )
                return;
              props.setSelectedBook(props.book);
              props.setIsBookPopupVisible(true);
            }}
            data-pr-tooltip={props.book.bookTitle}
            data-pr-position="right"
            data-pr-at="right+5 top"
            data-pr-my="left center-2"
          />
        </div>
        <div className="flex col-12 justify-content-start p-0">
          <p style={{ fontSize: "0.6rem" }} className="m-0 p-0">
            {props.book.displayMode}
          </p>
        </div>
        <div className="flex col-12 justify-content-start p-0">
          <p style={{ fontSize: "0.6rem" }} className="m-0 p-0">
            Count: {props.book.displayCount}
          </p>
        </div>
        <div className="flex col-12 justify-content-start p-0">
          <p style={{ fontSize: "0.6rem" }} className={`m-0 p-0`}>
            Space: {roundToTwoDecimalPlaces(props.book.shelfSpace)}
            {props.book.hasUnknownDimensions ? "*" : ""}
          </p>
        </div>
      </div>
    </SortableItem>
  );
}

// Component for creating a shelf's draggable books
export interface MultipleDraggableBooksProps {
  displayBooks: DisplayBook[];
  setSelectedBook: Updater<DisplayBook>;
  setIsBookPopupVisible: (isVisible: boolean) => void;
  isModifiable: boolean;
}

export function MultipleDraggableBooks(props: MultipleDraggableBooksProps) {
  return (
    <div className={"flex"}>
      {props.displayBooks.map((book) => (
        <DraggableBook
          book={book}
          key={book.id}
          setIsBookPopupVisible={props.setIsBookPopupVisible}
          setSelectedBook={props.setSelectedBook}
          isModifiable={props.isModifiable}
        />
      ))}
    </div>
  );
}

// Creating a droppable zone for the shelf (for when it is empty), as well as implementing the sorting
// of the books.
export interface ShelfWithBookImagesProps {
  shelf: Shelf;
  setSelectedBook: Updater<DisplayBook>;
  setIsBookPopupVisible: (isVisible: boolean) => void;
  isModifiable: boolean;
}

export function ShelfWithBookImages(props: ShelfWithBookImagesProps) {
  return (
    <Droppable id={props.shelf.id}>
      <SortableContext
        items={props.shelf.displayedBooks.map((book) => book.id)}
        strategy={horizontalListSortingStrategy}
      >
        <MultipleDraggableBooks
          displayBooks={props.shelf.displayedBooks}
          setIsBookPopupVisible={props.setIsBookPopupVisible}
          setSelectedBook={props.setSelectedBook}
          isModifiable={props.isModifiable}
        />
      </SortableContext>
    </Droppable>
  );
}

// The context is how drag and drop actually works. It's a wrapper around the children,
// where each SortableContext is a shelf, and each SortableItem is a book.
// The context also handles the drag and drop events.
// The DragOverlay handles animation for the book being dragged
export interface DragAndDropContextProps {
  shelves: Shelf[];
  setBookcase: Updater<Bookcase>;
  children: React.ReactNode;
  isModifiable: boolean;
}

export function DragAndDropContext(props: DragAndDropContextProps) {
  const [currentlyDraggedBook, setCurrentlyDraggedBook] =
    useState<DisplayBook>();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // If not modifiable, just return the children without the drag and drop context
  if (!props.isModifiable) return <>{props.children}</>;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={(e) =>
        onDragStart(e, props.shelves, setCurrentlyDraggedBook)
      }
      onDragOver={(e) => onDragOver(e, props.setBookcase)}
      onDragEnd={(e) =>
        onDragEnd(e, props.setBookcase, setCurrentlyDraggedBook)
      }
    >
      {props.children}
      <DragOverlay>
        {currentlyDraggedBook ? (
          <DraggableBook book={currentlyDraggedBook} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
