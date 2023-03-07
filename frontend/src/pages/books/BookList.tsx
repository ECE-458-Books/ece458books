import {
  APIBook,
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
import LabeledSwitch from "../../components/buttons/LabeledSwitch";
import SelectSizeButton, {
  SelectSizeButtonOptions,
} from "../../components/buttons/SelectSizeButton";
import { BookDetailLineItem } from "./BookDetailLineItems";
import { Button } from "primereact/button";
import { showFailure } from "../../components/Toast";
import { saveAs } from "file-saver";
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import ListTemplate from "../../templates/list/ListTemplate";

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
  lineItems: [],
};

interface ColumnMeta {
  field: string;
  header: string;
}

const columnsMeta: ColumnMeta[] = [
  { field: "isbn10", header: "ISBN 10" },
  { field: "publisher", header: "Publisher" },
  { field: "bestBuybackPrice", header: "Best Buyback Price ($)" },
  { field: "daysOfSupply", header: "Days of Supply" },
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
    useState<SelectSizeButtonOptions>(SelectSizeButtonOptions.Small);
  const [genreNamesList, setGenreNamesList] = useState<string[]>([]); // List of all genre names
  const [visibleColumns, setVisibleColumns] = useState<ColumnMeta[]>(
    columnsMeta.slice(2, 6)
  );

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
    },
    {
      field: "genres",
      header: "Genre",
      filterPlaceholder: "Search by Genre",
      filterable: true,
      sortable: true,
      customFilter: genreFilter({ width: "8rem" }),
      style: { minWidth: "10rem" },
    },
    {
      field: "isbn13",
      header: "ISBN 13",
      filterPlaceholder: "Search by ISBN",
      sortable: true,
      filterable: true,
      style: { minWidth: "8rem" },
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
      no_pagination: isNoPagination ? true : undefined,
      page: isNoPagination ? undefined : page,
      page_size: isNoPagination ? undefined : pageSize,
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
    if (!isNoPagination) {
      BOOKS_API.getBooks(createAPIRequest(page, pageSize, sortField)).then(
        (response) => onAPIResponse(response)
      );
    } else {
      BOOKS_API.getBooksNoPaginationLISTVIEW(
        createAPIRequest(page, pageSize, sortField)
      ).then((response) => onAPIResponseNoPagination(response));
    }
  };

  const onAPIResponseNoPagination = (response: APIBook[]) => {
    setBooks(response.map((book) => APIToInternalBookConversion(book)));
    setNumberOfBooks(response.length);
    setIsLoading(false);
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

  const toast = useRef<Toast>(null);

  const csvExportButton = (
    <Button
      type="button"
      label={"Export as CSV"}
      icon="pi pi-file-export"
      onClick={callCSVExportAPI}
      iconPos="right"
      className="p-button-sm my-auto"
    />
  );

  const shelfCalculator = (
    <Button
      label="Shelf Calculator"
      icon="pi pi-calculator"
      className="p-button-sm my-auto"
      onClick={() => navigate("/books/shelf-calculator")}
    />
  );

  const addBookButton = (
    <AddPageButton
      onClick={() => navigate("/books/add")}
      label="Add Book"
      className="mr-3"
    />
  );

  const rightSideButtons = (
    <>
      {csvExportButton}
      {shelfCalculator}
      {addBookButton}
    </>
  );

  const noPaginationSwitch = (
    <LabeledSwitch
      label="Show All"
      onChange={() => setIsNoPagination(!isNoPagination)}
      value={isNoPagination}
    />
  );

  const selectSizeButton = (
    <SelectSizeButton
      value={tableWhitespaceSize}
      onChange={(e) => setTableWhitespaceSize(e.value)}
      className="sm"
    />
  );

  const onColumnToggle = (event: MultiSelectChangeEvent) => {
    const selectedColumns = event.value;
    const orderedSelectedColumns = columnsMeta.filter((col) =>
      selectedColumns.some(
        (sCol: { field: string }) => sCol.field === col.field
      )
    );
    setVisibleColumns(orderedSelectedColumns);
  };

  const toggleColumns = (
    <MultiSelect
      value={visibleColumns}
      placeholder="Toggle Columns"
      options={columnsMeta}
      optionLabel="header"
      onChange={onColumnToggle}
      className="w-full sm:w-16rem"
      display="chip"
    />
  );

  const dataTable = (
    <ListTemplate
      columns={COLUMNS}
      detailPageURL="/books/detail/"
      whitespaceSize={tableWhitespaceSize}
      isNoPagination={isNoPagination}
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
    />
  );

  return (
    <div>
      <div className="grid justify-content-evenly flex m-1">
        {noPaginationSwitch}
        {toggleColumns}
        {selectSizeButton}
        {rightSideButtons}
      </div>
      <div className="card pt-0 px-3">
        <Toast ref={toast} />
        {dataTable}
      </div>
    </div>
  );
}
