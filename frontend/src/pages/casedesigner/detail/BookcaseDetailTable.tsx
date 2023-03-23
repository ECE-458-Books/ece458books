import { DataTable } from "primereact/datatable";
import DeleteColumn from "../../../components/datatable/DeleteColumn";
import {
  createColumns,
  TableColumn,
} from "../../../components/datatable/TableColumns";
import { BooksDropdownData } from "../../../components/dropdowns/BookDropdown";
import { filterById, findById } from "../../../util/IDOps";
import { Bookcase, DisplayBook, Shelf } from "../BookcaseList";
import { Column } from "primereact/column";
import { DragAndDropContext, ShelfWithBookImages } from "./DnDComponents";
import { useEffect, useRef, useState } from "react";
import { Updater } from "use-immer";
import { Button } from "primereact/button";
import { Book } from "../../books/BookList";
import { OverlayPanel } from "primereact/overlaypanel";
import AddBookPopover from "./AddBookPopover";

interface BookcaseDetailTableProps {
  shelves: Shelf[]; // The array of shelves
  setBookcase: Updater<Bookcase>; // Update the bookcase
  isAddPage: boolean; // True if this is an add page
  isModifiable: boolean; // True if this page is modifiable
  tableHeader?: JSX.Element; // add buttons and functionality to attached element of table on the top
}

export default function BookcaseDetailTable(props: BookcaseDetailTableProps) {
  const [booksMap, setBooksMap] = useState<Map<string, Book>>(new Map());
  const [bookTitlesList, setBookTitlesList] = useState<string[]>([]);
  const addBookOverlayPanelRef = useRef<OverlayPanel>(null);
  const [currentAddBookShelfId, setCurrentAddBookShelfId] =
    useState<string>("");

  const COLUMNS: TableColumn<Shelf>[] = [
    {
      field: "displayedBooks",
      header: "Displayed Books",
      customBody: (rowData: Shelf) => {
        return <ShelfWithBookImages shelf={rowData} />;
      },
    },
    {
      field: "none",
      header: "Add Book",
      customBody: (rowData: Shelf) => addBookButton(rowData),
      style: { width: "3rem", padding: "2" },
    },
  ];

  const addBookToCurrentShelf = (book: DisplayBook) => {
    props.setBookcase((draft) => {
      const shelf = findById(draft.shelves, currentAddBookShelfId)!;
      shelf.displayedBooks.push(book);
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
            addBookOverlayPanelRef.current!.toggle(e);
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
    <AddBookPopover
      booksDropdownTitles={bookTitlesList}
      panelRef={addBookOverlayPanelRef}
      booksMap={booksMap}
      addBookToShelf={addBookToCurrentShelf}
    />
  );

  // -------- DRAG AND DROP --------

  const setShelves = (shelves: Shelf[]) => {
    props.setBookcase((draft) => {
      draft.shelves = shelves;
    });
  };

  return (
    <DragAndDropContext shelves={props.shelves} setBookcase={props.setBookcase}>
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
        {props.isModifiable && <Column rowReorder style={{ width: "3rem" }} />}
        {columns}
        {deleteColumn}
      </DataTable>
      {addBookPopover}
    </DragAndDropContext>
  );
}
