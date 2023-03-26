import { DataTable } from "primereact/datatable";
import {
  createColumns,
  TableColumn,
} from "../../components/datatable/TableColumns";
import PriceTemplate from "../../components/templates/PriceTemplate";
import { ImageTemplate } from "../../components/templates/ImageTemplate";

export interface BookDetailRelatedBooksProps {
  relatedBooks?: RelatedBook[];
  globalClassName?: string;
}

export interface RelatedBook {
  id: string;
  author: string;
  genres: string;
  title: string;
  isbn13: string;
  publisher: string;
  publishedYear: number;
  retailPrice: number;
  imageUrl: string;
}

export default function BookDetailRelatedBooks(
  props: BookDetailRelatedBooksProps
) {
  // Filtering
  const COLUMNS: TableColumn<RelatedBook>[] = [
    {
      field: "imageUrl",
      header: "Cover Art",
      className: props.globalClassName,
      customBody: (rowData: RelatedBook) => ImageTemplate(rowData.imageUrl),
      style: { minWidth: "1rem", padding: "0.25rem" },
    },
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
      field: "publishedYear",
      header: "Publication Year",
      className: props.globalClassName,
      style: { minWidth: "4rem", width: "4rem" },
    },
    {
      field: "retailPrice",
      header: "Retail Price ($)",
      className: props.globalClassName,
      customBody: (rowData: RelatedBook) => PriceTemplate(rowData.retailPrice),
      style: { minWidth: "4rem", width: "8rem" },
    },
  ];

  const columns = createColumns(COLUMNS);
  return (
    <div className="card pt-0 px-3">
      <DataTable size="small" value={props.relatedBooks}>
        {columns}
      </DataTable>
    </div>
  );
}
