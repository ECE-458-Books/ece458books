import {
  BOOKS_API,
  GetBooksReq,
  GetBooksResp,
} from "../../apis/books/BooksAPI";
import { DataTableFilterEvent } from "primereact/datatable";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { DataTableFilterMetaData } from "primereact/datatable";
import { logger } from "../../util/Logger";
import { useLocation, useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
import { APIBookSortFieldMap } from "../../apis/books/BooksConversions";
import { APIToInternalBookConversion } from "../../apis/books/BooksConversions";
import { TableColumn } from "../../components/datatable/TableColumns";
import PriceTemplate from "../../components/templates/PriceTemplate";
import AlteredTextTemplate from "../../components/templates/AlteredTextTemplate";
import { imageBodyTemplate } from "../../components/templates/ImageTemplate";
import GenreDropdown, {
  GenresDropdownData,
} from "../../components/dropdowns/GenreDropdown";
import AddPageButton from "../../components/buttons/AddPageButton";
import { BookDetailLineItem } from "./BookDetailLineItems";
import { Button } from "primereact/button";
import { showFailure } from "../../components/Toast";
import { saveAs } from "file-saver";
import ListTemplate from "../../templates/list/ListTemplate";
import SelectSizeDropdown, {
  SelectSizeDropdownOptions,
} from "../../components/dropdowns/SelectSizeDropdown";
import ToggleColumnPopup from "../../components/popups/ToggleColumnPopup";
import ToggleColumnButton from "../../components/buttons/ToggleColumnButton";
import { CheckboxChangeEvent } from "primereact/checkbox";

export interface NewImageUploadData {
  imageFile: File;
  isImageUpload: boolean;
  isImageDelete: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  genres: string;
  isbn13: number;
  isbn10: string;
  publisher: string;
  publishedYear: number;
  pageCount?: number;
  width?: number;
  height?: number;
  thickness?: number;
  retailPrice: number;
  bestBuybackPrice?: number;
  stock: number;
  lastMonthSales?: number;
  thumbnailURL: string;
  newImageData?: NewImageUploadData;
  shelfSpace?: number;
  daysOfSupply?: string | number;
  lineItems?: BookDetailLineItem[];
  isGhost?: boolean;
  numRelatedBooks?: number;
}

interface Filters {
  [title: string]: DataTableFilterMetaData;
  author: DataTableFilterMetaData;
  isbn13: DataTableFilterMetaData;
  publisher: DataTableFilterMetaData;
}

// Used for initializing state
export const emptyBook: Book = {
  id: "0",
  title: "",
  author: "",
  genres: "",
  isbn13: 0,
  isbn10: "",
  publisher: "",
  publishedYear: 0,
  pageCount: 0,
  width: 0,
  height: 0,
  thickness: 0,
  retailPrice: 0,
  stock: 0,
  thumbnailURL: "",
  bestBuybackPrice: 0,
  lastMonthSales: 0,
  shelfSpace: 0,
  daysOfSupply: 0,
  numRelatedBooks: 0,
  lineItems: [],
};

export interface ColumnMeta {
  field: string;
  header: string;
}

const columnsMeta: ColumnMeta[] = [
  { field: "thumbnailURL", header: "Cover Art" },
  { field: "author", header: "Authors" },
  { field: "genres", header: "Genre" },
  { field: "isbn13", header: "ISBN 13" },
  { field: "isbn10", header: "ISBN 10" },
  { field: "publisher", header: "Publisher" },
  { field: "retailPrice", header: "Retail Price ($)" },
  { field: "bestBuybackPrice", header: "Best Buyback Price ($)" },
  { field: "stock", header: "Inventory Count" },
  { field: "daysOfSupply", header: "Days of Supply" },
  { field: "numRelatedBooks", header: "# of Related Books" },
  { field: "lastMonthSales", header: "Last Month Sales" },
  { field: "shelfSpace", header: "Shelf Space" },
];

export default function BookList() {
  // ----- STATE -----
  const navigate = useNavigate();
  const location = useLocation(); // Utilized if coming from the genre list
  const [isLoading, setIsLoading] = useState<boolean>(false); // Whether we show that the table is loading or not
  const [numberOfBooks, setNumberOfBooks] = useState<number>(0); // The number of books that match the query
  const [books, setBooks] = useState<Book[]>([]); // The book data itself (rows of the table)
  const [selectedGenre, setSelectedGenre] = useState<string>(
    location.state?.genre ?? ""
  ); // Initialize genre to the genre passed, if coming from genre list
  const [isNoPagination, setIsNoPagination] = useState<boolean>(false);
  const [tableWhitespaceSize, setTableWhitespaceSize] =
    useState<SelectSizeDropdownOptions>(SelectSizeDropdownOptions.Small);
  const [genreNamesList, setGenreNamesList] = useState<string[]>([]); // List of all genre names

  const [visibleColumns, setVisibleColumns] = useState<ColumnMeta[]>(
    [0, 1, 2, 3, 6, 7, 8, 9, 10, 11, 12].map((x) => columnsMeta[x])
  );

  const [toggleColumnPopupVisible, setToggleColumnPopupVisible] =
    useState<boolean>(false); // Whether the toggle column popup is visible

  // Genres dropdown custom filter

  useEffect(() => {
    GenresDropdownData({ setGenreNamesList });
  }, []);

  const genreFilter = (style: CSSProperties) => (
    <GenreDropdown
      selectedGenre={selectedGenre}
      setSelectedGenre={setSelectedGenre}
      genresList={genreNamesList}
      style={style}
      showClearButton={true}
    />
  );

  // Filtering
  const COLUMNS: TableColumn<Book>[] = [
    {
      field: "thumbnailURL",
      header: "Cover Art",
      customBody: (rowData: Book) => imageBodyTemplate(rowData.thumbnailURL),
      style: { minWidth: "1rem", padding: "0.25rem" },
      hidden: !(
        visibleColumns.filter((item) => item.field == "thumbnailURL").length > 0
      ),
    },
    {
      field: "title",
      header: "Title",
      filterPlaceholder: "Search by Title",
      sortable: true,
      filterable: true,
    },
    {
      field: "author",
      header: "Authors",
      filterPlaceholder: "Search by Authors",
      sortable: true,
      filterable: true,
      style: { minWidth: "8rem" },
      hidden: !(
        visibleColumns.filter((item) => item.field == "author").length > 0
      ),
    },
    {
      field: "genres",
      header: "Genre",
      filterPlaceholder: "Search by Genre",
      filterable: true,
      sortable: true,
      customFilter: genreFilter({ width: "8rem" }),
      style: { minWidth: "10rem" },
      hidden: !(
        visibleColumns.filter((item) => item.field == "genres").length > 0
      ),
    },
    {
      field: "isbn13",
      header: "ISBN 13",
      filterPlaceholder: "Search by ISBN",
      sortable: true,
      filterable: true,
      style: { minWidth: "8rem" },
      hidden: !(
        visibleColumns.filter((item) => item.field == "isbn13").length > 0
      ),
    },
    {
      field: "isbn10",
      header: "ISBN 10",
      filterPlaceholder: "Search by ISBN",
      sortable: true,
      filterable: false,
      style: { minWidth: "6rem" },
      hidden: !(
        visibleColumns.filter((item) => item.field == "isbn10").length > 0
      ),
    },
    {
      field: "publisher",
      header: "Publisher",
      filterPlaceholder: "Search by Publisher",
      sortable: true,
      filterable: true,
      hidden: !(
        visibleColumns.filter((item) => item.field == "publisher").length > 0
      ),
    },
    {
      field: "retailPrice",
      header: "Retail Price ($)",
      sortable: true,
      customBody: (rowData: Book) => PriceTemplate(rowData.retailPrice),
      style: { minWidth: "6rem" },
      hidden: !(
        visibleColumns.filter((item) => item.field == "retailPrice").length > 0
      ),
    },
    {
      field: "bestBuybackPrice",
      header: "Best Buyback Price ($)",
      customBody: (rowData: Book) => PriceTemplate(rowData.bestBuybackPrice),
      style: { minWidth: "6rem" },
      hidden: !(
        visibleColumns.filter((item) => item.field == "bestBuybackPrice")
          .length > 0
      ),
    },
    {
      field: "stock",
      header: "Inventory Count",
      sortable: true,
      style: { minWidth: "4rem" },
      hidden: !(
        visibleColumns.filter((item) => item.field == "stock").length > 0
      ),
    },
    {
      field: "daysOfSupply",
      header: "Days of Supply",
      sortable: true,
      style: { minWidth: "3rem" },
      hidden: !(
        visibleColumns.filter((item) => item.field == "daysOfSupply").length > 0
      ),
    },
    {
      field: "numRelatedBooks",
      header: "# of Related Books",
      sortable: true,
      style: { minWidth: "3rem" },
      hidden: !(
        visibleColumns.filter((item) => item.field == "numRelatedBooks")
          .length > 0
      ),
    },
    {
      field: "lastMonthSales",
      header: "Last Month Sales",
      sortable: true,
      style: { minWidth: "3rem" },
      hidden: !(
        visibleColumns.filter((item) => item.field == "lastMonthSales").length >
        0
      ),
    },
    {
      field: "shelfSpace",
      header: "Shelf Space (Bold = Estimation)",
      sortable: true,
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

  const [filterParams, setFilterParams] = useState<DataTableFilterEvent>({
    filters: {
      title: { value: "", matchMode: "contains" },
      author: { value: "", matchMode: "contains" },
      isbn13: { value: "", matchMode: "contains" },
      publisher: { value: "", matchMode: "contains" },
    } as Filters,
  });

  const onFilter = (event: DataTableFilterEvent) => {
    logger.debug("Filter Applied", event);
    setIsLoading(true);
    setFilterParams(event);
  };

  const createAPIRequest = (
    page: number,
    pageSize: number,
    sortField: string
  ): GetBooksReq => {
    // Only search by one of the search boxes
    let search_string = "";
    let title_only = false;
    let publisher_only = false;
    let author_only = false;
    let isbn_only = false;
    if (
      "value" in filterParams.filters.title &&
      filterParams.filters.title.value
    ) {
      search_string = filterParams.filters.title.value;
      title_only = true;
    } else if (
      "value" in filterParams.filters.publisher &&
      filterParams.filters.publisher.value
    ) {
      search_string = filterParams.filters.publisher.value;
      publisher_only = true;
    } else if (
      "value" in filterParams.filters.author &&
      filterParams.filters.author.value
    ) {
      search_string = filterParams.filters.author.value;
      author_only = true;
    } else if (
      "value" in filterParams.filters.isbn13 &&
      filterParams.filters.isbn13.value
    ) {
      search_string = filterParams.filters.isbn13.value ?? "";
      isbn_only = true;
    }

    return {
      page: page,
      page_size: pageSize,
      ordering: sortField,
      genre: selectedGenre,
      search: search_string,
      title_only: title_only,
      publisher_only: publisher_only,
      author_only: author_only,
      isbn_only: isbn_only,
    };
  };

  // Calls the Books API
  const callAPI = (page: number, pageSize: number, sortField: string) => {
    BOOKS_API.getBooks(createAPIRequest(page, pageSize, sortField)).then(
      (response) => onAPIResponse(response)
    );
  };

  // Set state when response to API call is received
  const onAPIResponse = (response: GetBooksResp) => {
    setBooks(response.results.map((book) => APIToInternalBookConversion(book)));
    setNumberOfBooks(response.count);
    setIsLoading(false);
  };

  const callCSVExportAPI = () => {
    BOOKS_API.exportAsCSV(createAPIRequest(0, 0, ""))
      .then((response) => {
        const blob = new Blob([response], {
          type: "text/csv;charset=utf-8",
        });
        saveAs(blob, "books.csv");
      })
      .catch(() => {
        showFailure(toast, "Could not export to CSV");
      });
  };

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

  const toast = useRef<Toast>(null);

  const csvExportButton = (
    <Button
      type="button"
      label={"Export as CSV"}
      icon="pi pi-file-export"
      onClick={callCSVExportAPI}
      iconPos="right"
      className="p-button-sm my-auto mr-1"
    />
  );

  const shelfCalculator = (
    <Button
      label="Shelf Calculator"
      icon="pi pi-calculator"
      className="p-button-sm my-auto mr-1"
      onClick={() => navigate("/books/shelf-calculator")}
    />
  );

  const addBookButton = (
    <AddPageButton
      onClick={() => navigate("/books/add")}
      label="Add Book"
      className="my-auto mr-3"
    />
  );

  const rightSideButtons = (
    <>
      {shelfCalculator}
      {csvExportButton}
      {addBookButton}
    </>
  );

  const selectSizeButton = (
    <div className="my-auto">
      <SelectSizeDropdown
        value={tableWhitespaceSize}
        onChange={(e) => setTableWhitespaceSize(e.value)}
        className="sm"
      />
    </div>
  );

  const toggleColumnButton = (
    <div className="my-auto">
      <ToggleColumnButton
        onClick={toggleColumnPopupVisibity}
        className="mr-2"
      />
    </div>
  );

  const dataTable = (
    <ListTemplate
      columns={COLUMNS}
      detailPageURL="/books/detail/"
      whitespaceSize={tableWhitespaceSize}
      isNoPagination={isNoPagination}
      setIsNoPagination={setIsNoPagination}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
      totalNumberOfEntries={numberOfBooks}
      setTotalNumberOfEntries={setNumberOfBooks}
      rows={books}
      APISortFieldMap={APIBookSortFieldMap}
      callGetAPI={callAPI}
      onFilter={onFilter}
      filters={filterParams.filters}
      additionalAPITriggers={[selectedGenre, filterParams]}
      paginatorLeft={toggleColumnButton}
      paginatorRight={selectSizeButton}
    />
  );

  return (
    <div>
      <div className="grid justify-content-end flex my-2">
        <div className="flex justify-content-end m-0 p-0 col-5">
          {rightSideButtons}
        </div>
      </div>
      <div className="card pt-0 px-3">
        <Toast ref={toast} />
        {dataTable}
      </div>
      {toggleColumnPopupVisible && toggleColumnPopup}
    </div>
  );
}
