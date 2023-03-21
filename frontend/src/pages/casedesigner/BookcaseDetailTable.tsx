import { DataTable } from "primereact/datatable";
import DeleteColumn from "../../components/datatable/DeleteColumn";
import {
  createColumns,
  TableColumn,
} from "../../components/datatable/TableColumns";
import BooksDropdown from "../../components/dropdowns/BookDropdown";
import { filterById } from "../../util/IDOps";
import { v4 as uuid } from "uuid";
import { Shelf } from "./BookcaseList";
import { useState } from "react";
import { Column } from "primereact/column";

interface BookcaseDetailTableProps {
  shelves: Shelf[]; // The array of purchases/sales
  setShelves: (shelves: Shelf[]) => void; // Update the array of purchases/sales
  isAddPage: boolean; // True if this is an add page
  isModifiable: boolean; // True if this page is modifiable
  booksDropdownTitles: string[]; // The list of books for the books dropdown
  tableHeader?: JSX.Element; // add buttons and functionality to attached element of table on the top
}

export default function BookcaseDetailTable(props: BookcaseDetailTableProps) {
  const COLUMNS: TableColumn<Shelf>[] = [
    {
      field: "displayedBooks",
      header: "Displayed Books",
      customBody: (rowData: Shelf) => {
        return <div>Test</div>;
      },
    },
  ];

  // Delete icon for each row
  const deleteColumn = DeleteColumn<Shelf>({
    onDelete: (rowData) => {
      filterById(props.shelves, rowData.id!, props.setShelves);
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

  return (
    <DataTable
      showGridlines
      header={props.tableHeader}
      value={props.shelves}
      className="editable-cells-table"
      responsiveLayout="scroll"
      editMode="cell"
      rowHover={!props.isAddPage && !props.isModifiable}
      selectionMode={"single"}
      reorderableRows={true}
      onRowReorder={(e) => {
        // I think something is wrong with the PrimeReact library, because
        // the code in the demo works, but TypeScript complains about it
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        props.setShelves(e.value);
      }}
    >
      <Column rowReorder style={{ width: "3rem" }} />
      {columns}
      {deleteColumn}
      {/* ADD ROW COLUMN} */}
    </DataTable>
  );
}
