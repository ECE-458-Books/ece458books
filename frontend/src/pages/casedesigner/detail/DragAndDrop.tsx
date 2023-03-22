import { useDroppable } from "@dnd-kit/core";
import {
  MAX_IMAGE_HEIGHT,
  MAX_IMAGE_WIDTH,
} from "../../../components/editors/PriceEditor";
import { Image } from "primereact/image";
import { DisplayBook, Shelf } from "../BookcaseList";
import {
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// DEPRECATED
export interface DroppableProps {
  id: string;
  children: React.ReactNode;
}

export function Droppable(props: DroppableProps) {
  const { setNodeRef } = useDroppable({
    id: props.id,
  });

  return <div ref={setNodeRef}>{props.children}</div>;
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
}

export function DraggableBook(props: DraggableBookProps) {
  return (
    <SortableItem id={props.book.id} key={props.book.id}>
      <Image
        src={"https://books-test.colab.duke.edu/media/books/default.jpeg"}
        id={props.book.id}
        alt="Image"
        imageStyle={{
          objectFit: "contain",
          maxHeight: MAX_IMAGE_HEIGHT,
          maxWidth: MAX_IMAGE_WIDTH,
        }}
        className="flex justify-content-center"
        imageClassName="shadow-2 border-round"
      />
    </SortableItem>
  );
}

// Component for creating a shelf's draggable books
export interface MultipleDraggableBooksProps {
  displayBooks: DisplayBook[];
}

export function MultipleDraggableBooks(props: MultipleDraggableBooksProps) {
  return (
    <div>
      {props.displayBooks.map((book) => (
        <DraggableBook book={book} key={book.id} />
      ))}
    </div>
  );
}

// Creating a droppable zone for the shelf (for when it is empty), as well as implementing the sorting
// of the books.
export interface ShelfWithBookImagesProps {
  shelf: Shelf;
}

export function ShelfWithBookImages(props: ShelfWithBookImagesProps) {
  return (
    <Droppable id={props.shelf.id}>
      <SortableContext
        items={props.shelf.displayedBooks.map((book) => book.id)}
        strategy={horizontalListSortingStrategy}
      >
        <MultipleDraggableBooks displayBooks={props.shelf.displayedBooks} />
      </SortableContext>
    </Droppable>
  );
}
