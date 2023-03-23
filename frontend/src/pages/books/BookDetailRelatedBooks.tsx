import { DataTable, DataTableRowClickEvent } from "primereact/datatable";
import { useNavigate } from "react-router-dom";
import {
  createColumns,
  TableColumn,
} from "../../components/datatable/TableColumns";
import { logger } from "../../util/Logger";
import PriceTemplate from "../../components/templates/PriceTemplate";
import { Book } from "./BookList";

export interface BookDetailRelatedBooksProps {
  relatedBooks: Book[];
}

export default function BookDetailRelatedBooks(
  props: BookDetailRelatedBooksProps
) {
  const navigate = useNavigate();

  const COLUMNS: TableColumn<Book>[] = [
    {
      header: "Title",
      field: "title",
      style: { minWidth: "8rem", width: "8rem" },
    },
    {
      header: "Author",
      field: "authors",
      style: { minWidth: "8rem", width: "12rem" },
    },
    {
      header: "Publisher",
      field: "publisher",
      style: { minWidth: "8rem", width: "22rem" },
    },
    {
      header: "Pulish Year",
      field: "publishedYear",
      style: { minWidth: "6rem", width: "10rem" },
    },
    {
      header: "ISBN 13",
      field: "isbn13",
      style: { minWidth: "8rem", width: "22rem" },
    },
    {
      header: "Quantity",
      field: "quantity",
      style: { minWidth: "6rem", width: "8rem" },
    },
    {
      header: "Retail Price",
      field: "retailPrice",
      customBody: (rowData: Book) => PriceTemplate(rowData.retailPrice),
      style: { minWidth: "6rem", width: "8rem" },
    },
  ];

  const onRowClick = (event: DataTableRowClickEvent) => {
    const lineItem = event.data as Book;
    logger.debug("Line Item Clicked (Book Detail View)", lineItem);
    const urlExtension = LineItemURLMapper.get(lineItem.type);
    navigate(`/${urlExtension}/detail/${lineItem.id}`);
  };

  const columns = createColumns(COLUMNS);
  return (
    <DataTable
      onRowClick={onRowClick}
      rowHover
      size="small"
      value={props.lineItems}
    >
      {columns}
    </DataTable>
  );
}
