import { DataTable, DataTableRowClickEvent } from "primereact/datatable";
import { useNavigate } from "react-router-dom";
import {
  createColumns,
  TableColumn,
} from "../../components/datatable/TableColumns";
import { logger } from "../../util/Logger";
import PriceTemplate from "../../components/templates/PriceTemplate";
import { Book, ColumnMeta, columnsMeta } from "./BookList";
import { useState } from "react";
import AlteredTextTemplate from "../../components/templates/AlteredTextTemplate";
import { imageBodyTemplate } from "../../components/templates/ImageTemplate";
import ToggleColumnPopup from "../../components/popups/ToggleColumnPopup";
import ToggleColumnButton from "../../components/buttons/ToggleColumnButton";
import { CheckboxChangeEvent } from "primereact/checkbox";

export interface BookDetailRelatedBooksProps {
  relatedBooks?: Book[];
}

export default function BookDetailRelatedBooks(
  props: BookDetailRelatedBooksProps
) {
  const [visibleColumns, setVisibleColumns] = useState<ColumnMeta[]>(
    [0, 1, 3, 5, 6, 8].map((x) => columnsMeta[x])
  );
  const [toggleColumnPopupVisible, setToggleColumnPopupVisible] =
    useState<boolean>(false); // Whether the toggle column popup is visible

  const navigate = useNavigate();

  // Filtering
  const COLUMNS: TableColumn<Book>[] = [
    {
      field: "thumbnailURL",
      header: "Cover Art",
      customBody: (rowData: Book) => imageBodyTemplate(rowData.thumbnailURL),
      style: { minWidth: "1rem", padding: "0.25rem", width: "2rem" },
      hidden: !(
        visibleColumns.filter((item) => item.field == "thumbnailURL").length > 0
      ),
    },
    {
      field: "title",
      header: "Title",
      style: { minWidth: "11rem", width: "22rem" },
    },
    {
      field: "author",
      header: "Authors",
      filterPlaceholder: "Search by Authors",
      style: { minWidth: "7rem", width: "12rem" },
      hidden: !(
        visibleColumns.filter((item) => item.field == "author").length > 0
      ),
    },
    {
      field: "genres",
      header: "Genre",
      style: { minWidth: "6rem" },
      hidden: !(
        visibleColumns.filter((item) => item.field == "genres").length > 0
      ),
    },
    {
      field: "isbn13",
      header: "ISBN 13",
      style: { minWidth: "6rem", width: "6rem" },
      hidden: !(
        visibleColumns.filter((item) => item.field == "isbn13").length > 0
      ),
    },
    {
      field: "isbn10",
      header: "ISBN 10",
      style: { minWidth: "6rem" },
      hidden: !(
        visibleColumns.filter((item) => item.field == "isbn10").length > 0
      ),
    },
    {
      field: "publisher",
      header: "Publisher",
      style: { minWidth: "8rem", width: "14rem" },
      hidden: !(
        visibleColumns.filter((item) => item.field == "publisher").length > 0
      ),
    },
    {
      field: "retailPrice",
      header: "Retail Price ($)",
      customBody: (rowData: Book) => PriceTemplate(rowData.retailPrice),
      style: { minWidth: "4rem", width: "8rem" },
      hidden: !(
        visibleColumns.filter((item) => item.field == "retailPrice").length > 0
      ),
    },
    {
      field: "bestBuybackPrice",
      header: "Best Buyback Price ($)",
      customBody: (rowData: Book) => PriceTemplate(rowData.bestBuybackPrice),
      style: { minWidth: "4rem" },
      hidden: !(
        visibleColumns.filter((item) => item.field == "bestBuybackPrice")
          .length > 0
      ),
    },
    {
      field: "stock",
      header: "Inventory Count",
      style: { minWidth: "4rem", width: "8rem" },
      hidden: !(
        visibleColumns.filter((item) => item.field == "stock").length > 0
      ),
    },
    {
      field: "daysOfSupply",
      header: "Days of Supply",
      style: { minWidth: "3rem", width: "8rem" },
      hidden: !(
        visibleColumns.filter((item) => item.field == "daysOfSupply").length > 0
      ),
    },
    {
      field: "numRelatedBooks",
      header: "# of Related Books",
      style: { minWidth: "3rem" },
      hidden: !(
        visibleColumns.filter((item) => item.field == "numRelatedBooks")
          .length > 0
      ),
    },
    {
      field: "lastMonthSales",
      header: "Last Month Sales",
      style: { minWidth: "3rem" },
      hidden: !(
        visibleColumns.filter((item) => item.field == "lastMonthSales").length >
        0
      ),
    },
    {
      field: "shelfSpace",
      header: "Shelf Space (Bold = Estimation)",
      customBody: (rowData: Book) =>
        AlteredTextTemplate(
          rowData.thickness ? "" : "font-bold",
          rowData.shelfSpace
        ),
      style: { minWidth: "3rem" },
      hidden: !(
        visibleColumns.filter((item) => item.field == "shelfSpace").length > 0
      ),
    },
  ];

  const toggleColumnPopupVisibity = () => {
    logger.debug("Toggle Column Clicked");
    setToggleColumnPopupVisible(true);
  };

  const toggleColumnFinal = () => {
    logger.debug("Toggle Column Finalized");
    setToggleColumnPopupVisible(false);
  };

  const onToggleColumnChange = (e: CheckboxChangeEvent) => {
    let _selectedColumns = [...visibleColumns];

    if (e.checked) _selectedColumns.push(e.value);
    else
      _selectedColumns = _selectedColumns.filter(
        (category) => category.field !== e.value.field
      );

    setVisibleColumns(_selectedColumns);
  };

  const onToggleColumnSelectAll = (e: CheckboxChangeEvent) => {
    if (e.checked) setVisibleColumns(columnsMeta);
    else setVisibleColumns([]);
  };

  const toggleColumnPopup = (
    <ToggleColumnPopup
      onOptionChange={onToggleColumnChange}
      optionsList={columnsMeta}
      onSelectAllChange={onToggleColumnSelectAll}
      selectedOptions={visibleColumns}
      onConfirm={() => toggleColumnFinal()}
      setIsVisible={setToggleColumnPopupVisible}
    />
  );

  const onRowClick = (event: DataTableRowClickEvent) => {
    const lineItem = event.data as Book;
    logger.debug("Line Item Clicked (Book Detail View)", lineItem);
    navigate(`/books/detail/${lineItem.id}`);
    window.location.reload();
  };

  const toggleColumnButton = (
    <div className="my-auto">
      <ToggleColumnButton
        onClick={toggleColumnPopupVisibity}
        className="mr-2"
      />
    </div>
  );

  const columns = createColumns(COLUMNS);
  return (
    <div className="card pt-0 px-3">
      <DataTable
        onRowClick={onRowClick}
        rowHover
        size="small"
        value={props.relatedBooks}
        header={toggleColumnButton}
        responsiveLayout="scroll"
      >
        {columns}
      </DataTable>
      {toggleColumnPopupVisible && toggleColumnPopup}
    </div>
  );
}
