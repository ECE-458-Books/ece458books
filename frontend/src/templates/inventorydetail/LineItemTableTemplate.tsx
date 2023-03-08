import { DataTable, DataTableRowClickEvent } from "primereact/datatable";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useImmer } from "use-immer";
import DeleteColumn from "../../components/datatable/DeleteColumn";
import {
  createColumns,
  TableColumn,
} from "../../components/datatable/TableColumns";
import BooksDropdown, {
  BooksDropdownData,
} from "../../components/dropdowns/BookDropdown";
import { NumberEditor } from "../../components/editors/NumberEditor";
import { PriceEditor } from "../../components/editors/PriceEditor";
import PriceTemplate from "../../components/templates/PriceTemplate";
import { Book } from "../../pages/books/BookList";
import { filterById, findById } from "../../util/IDOps";
import { calculateTotal } from "../../util/LineItemOps";
import { errorCellBody } from "../errors/CSVImportErrors";
import { v4 as uuid } from "uuid";

export interface LineItem {
  isNewRow: boolean;
  id: string;
  bookId: number;
  bookISBN: string;
  bookTitle: string;
  quantity: number;
  price: number;
  csvErrors?: { [key: string]: string };
}

export const emptyLineItem: LineItem = {
  isNewRow: true,
  id: uuid(),
  bookId: 0,
  bookISBN: "",
  bookTitle: "",
  quantity: 1,
  price: 0,
};

interface InventoryDetailTemplateProps {
  lineItems: LineItem[]; // The array of purchases/sales
  priceColumnHeader: string; // The header of the price column (retail, wholesale, buyback)
  isCSVErrorsColumnShowing: boolean; // If the CSV errors column is showing
  setTotalDollars: (totalDollars: number) => void; // Update the calculated total
  isAddPage: boolean; // True if this is an add page
  isModifiable: boolean; // True if this page is modifiable
}

export default function LineItemTableTemplate(
  props: InventoryDetailTemplateProps
) {
  const navigate = useNavigate();
  // The line item data
  const [lineItems, setLineItems] = useImmer<LineItem[]>(props.lineItems);
  // For books dropdown
  const [booksMap, setBooksMap] = useState<Map<string, Book>>(new Map());
  const [booksDropdownTitles, setBooksDropdownTitles] = useState<string[]>([]);

  const COLUMNS: TableColumn<LineItem>[] = [
    {
      field: "errors",
      header: "CSV Errors",
      hidden: !props.isCSVErrorsColumnShowing,
      customBody: (rowData: LineItem) => errorCellBody(rowData.csvErrors),
      style: { minWidth: "8rem" },
    },
    {
      field: "bookTitle",
      header: "Book",
      customBody: (rowData: LineItem) =>
        booksDropDownEditor(
          rowData.bookTitle,
          (newValue) => {
            setLineItems((draft) => {
              const lineItem = findById(draft, rowData.id)!;
              lineItem.bookTitle = newValue;
              lineItem.price = booksMap.get(newValue)!.retailPrice;
              props.setTotalDollars(calculateTotal(draft));
            });
          },
          !props.isModifiable
        ),
    },

    {
      field: "quantity",
      header: "Quantity",
      customBody: (rowData: LineItem) =>
        NumberEditor(
          rowData.quantity,
          (newValue) => {
            setLineItems((draft) => {
              const lineItem = findById(lineItems, rowData.id)!;
              lineItem.quantity = newValue;
              props.setTotalDollars(calculateTotal(draft));
            });
          },
          "integernumberPODetail",
          !props.isModifiable
        ),
      style: { minWidth: "8rem" },
    },
    {
      field: "price",
      header: props.priceColumnHeader,
      customBody: (rowData: LineItem) =>
        PriceEditor(
          rowData.price,
          (newValue) => {
            setLineItems((draft) => {
              const lineItem = findById(lineItems, rowData.id)!;
              lineItem.price = newValue;
              props.setTotalDollars(calculateTotal(draft));
            });
          },
          "retailnumberPODetail",
          !props.isModifiable
        ),
      style: { minWidth: "10rem" },
    },
    {
      field: "subtotal",
      header: "Subtotal ($)",
      customBody: (rowData: LineItem) =>
        PriceTemplate(rowData.price * rowData.quantity),
      style: { minWidth: "8rem" },
    },
  ];

  // Delete icon for each row
  const deleteColumn = DeleteColumn<LineItem>({
    onDelete: (rowData) => {
      const newSales = filterById(lineItems, rowData.id, setLineItems);
      props.setTotalDollars(calculateTotal(newSales));
    },
    hidden: !props.isModifiable,
  });

  const columns = createColumns(COLUMNS);

  // -------- HELPER FUNCTIONS --------

  const onRowClick = (event: DataTableRowClickEvent) => {
    const lineItem = event.data as LineItem;
    if (!props.isAddPage && !props.isModifiable) {
      navigate(`/books/detail/${lineItem.bookId}`);
    }
  };

  // -------- VISUAL COMPONENTS --------

  // Books Dropdown
  useEffect(
    () =>
      BooksDropdownData({
        setBooksMap: setBooksMap,
        setBookTitlesList: setBooksDropdownTitles,
      }),
    []
  );

  const booksDropDownEditor = (
    value: string,
    onChange: (newValue: string) => void,
    isDisabled?: boolean
  ) => (
    <BooksDropdown
      // This will always be used in a table cell, so we can disable the warning
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      setSelectedBook={onChange}
      selectedBook={value}
      isDisabled={isDisabled}
      bookTitlesList={booksDropdownTitles}
      placeholder={value}
    />
  );

  return (
    <DataTable
      showGridlines
      value={lineItems}
      className="editable-cells-table"
      responsiveLayout="scroll"
      editMode="cell"
      rowHover={!props.isAddPage && !props.isModifiable}
      selectionMode={"single"}
      onRowClick={(event) => onRowClick(event)}
    >
      {columns}
      {deleteColumn}
    </DataTable>
  );
}
