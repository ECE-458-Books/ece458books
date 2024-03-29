import { DataTable, DataTableRowClickEvent } from "primereact/datatable";
import { useNavigate } from "react-router-dom";
import { Updater } from "use-immer";
import DeleteColumn from "../../components/datatable/DeleteColumn";
import {
  createColumns,
  TableColumn,
} from "../../components/datatable/TableColumns";
import BooksDropdown from "../../components/dropdowns/BookDropdown";
import { PriceEditor } from "../../components/editors/PriceEditor";
import PriceTemplate from "../../components/templates/PriceTemplate";
import { filterById, findById } from "../../util/IDOps";
import { calculateTotal } from "../../util/LineItemOps";
import { errorCellBody } from "../errors/CSVImportErrors";
import { v4 as uuid } from "uuid";
import { NormalTextDisplay } from "../../components/text/NormalTextDisplay";
import { isHighlightingText } from "../../util/ClickCheck";
import { IntegerEditor } from "../../components/editors/IntegerEditor";

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
  setLineItems: Updater<LineItem[]>; // Update the array of purchases/sales
  priceColumnHeader: string; // The header of the price column (retail, wholesale, buyback)
  isCSVErrorsColumnShowing: boolean; // If the CSV errors column is showing
  setTotalDollars: (totalDollars: number) => void; // Update the calculated total
  getPriceForNewlySelectedBook: (title: string) => Promise<number>; // Update the price for a newly selected book
  isAddPage: boolean; // True if this is an add page
  isModifiable: boolean; // True if this page is modifiable
  booksDropdownTitles: string[]; // The list of books for the books dropdown
  tableHeader?: JSX.Element; // add buttons and functionality to attached element of table on the top
}

export default function LineItemTableTemplate(
  props: InventoryDetailTemplateProps
) {
  const navigate = useNavigate();

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
      customBody: (rowData: LineItem) => {
        return !props.isModifiable
          ? NormalTextDisplay({ value: rowData.bookTitle })
          : booksDropDownEditor(
              rowData.bookTitle,
              async (newValue) => {
                const newPrice = await props.getPriceForNewlySelectedBook(
                  newValue
                );
                props.setLineItems((draft) => {
                  const lineItem = findById(draft, rowData.id)!;
                  lineItem.bookTitle = newValue;
                  lineItem.price = newPrice;
                  props.setTotalDollars(calculateTotal(draft));
                });
              },
              !props.isModifiable
            );
      },
    },

    {
      field: "quantity",
      header: "Quantity",
      customBody: (rowData: LineItem) => {
        return !props.isModifiable
          ? NormalTextDisplay({ value: rowData.quantity })
          : IntegerEditor(
              rowData.quantity,
              (newValue) => {
                props.setLineItems((draft) => {
                  const lineItem = findById(draft, rowData.id)!;
                  lineItem.quantity = newValue;
                  props.setTotalDollars(calculateTotal(draft));
                });
              },
              "integernumberPODetail",
              !props.isModifiable
            );
      },
      style: { minWidth: "8rem" },
    },
    {
      field: "price",
      header: props.priceColumnHeader,
      customBody: (rowData: LineItem) => {
        return !props.isModifiable
          ? PriceTemplate(rowData.price)
          : PriceEditor(
              rowData.price,
              (newValue) => {
                props.setLineItems((draft) => {
                  const lineItem = findById(draft, rowData.id)!;
                  lineItem.price = newValue;
                  props.setTotalDollars(calculateTotal(draft));
                });
              },
              "retailnumberPODetail",
              !props.isModifiable
            );
      },
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
      const newLineItems = filterById(
        props.lineItems,
        rowData.id,
        props.setLineItems
      );
      props.setTotalDollars(calculateTotal(newLineItems));
    },
    hidden: !props.isModifiable,
  });

  const columns = createColumns(COLUMNS);

  // -------- HELPER FUNCTIONS --------

  const onRowClick = (event: DataTableRowClickEvent) => {
    const lineItem = event.data as LineItem;
    if (!props.isAddPage && !props.isModifiable && !isHighlightingText()) {
      navigate(`/books/detail/${lineItem.bookId}`);
    }
  };

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
      value={props.lineItems}
      className="editable-cells-table"
      responsiveLayout="scroll"
      editMode="cell"
      rowHover={!props.isAddPage && !props.isModifiable}
      selectionMode={"single"}
      onRowClick={(event) => onRowClick(event)}
      emptyMessage={
        'Click "Add Book" or "Import CSV" to add line items to the table'
      }
    >
      {columns}
      {deleteColumn}
    </DataTable>
  );
}
