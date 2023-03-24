import { DataTable } from "primereact/datatable";
import {
  createColumns,
  TableColumn,
} from "../../components/datatable/TableColumns";
import PriceTemplate from "../../components/templates/PriceTemplate";
import { Book } from "./BookList";

export interface BookDetailRelatedBooksProps {
  relatedBooks?: Book[];
  globalClassName?: string;
}

export default function BookDetailRelatedBooks(
  props: BookDetailRelatedBooksProps
) {
  // Filtering
  const COLUMNS: TableColumn<Book>[] = [
    {
      field: "title",
      header: "Title",
      className: props.globalClassName,
      style: { minWidth: "11rem", width: "22rem" },
    },
    {
      field: "author",
      header: "Authors",
      filterPlaceholder: "Search by Authors",
      className: props.globalClassName,
      style: { minWidth: "7rem", width: "12rem" },
    },
    {
      field: "genres",
      header: "Genre",
      className: props.globalClassName,
      style: { minWidth: "6rem", width: "12rem" },
    },
    {
      field: "isbn13",
      header: "ISBN 13",
      className: props.globalClassName,
      style: { minWidth: "6rem", width: "6rem" },
    },
    {
      field: "publisher",
      header: "Publisher",
      className: props.globalClassName,
      style: { minWidth: "8rem", width: "14rem" },
    },
    {
      field: "retailPrice",
      header: "Retail Price ($)",
      className: props.globalClassName,
      customBody: (rowData: Book) => PriceTemplate(rowData.retailPrice),
      style: { minWidth: "4rem", width: "8rem" },
    },
  ];

  const columns = createColumns(COLUMNS);
  return (
    <div className="card pt-0 px-3">
      <DataTable
        size="small"
        value={props.relatedBooks}
        responsiveLayout="scroll"
      >
        {columns}
      </DataTable>
    </div>
  );
}
