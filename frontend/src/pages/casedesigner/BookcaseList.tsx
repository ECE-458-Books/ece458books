import { DisplayMode } from "../../components/dropdowns/DisplayModeDropdown";
import { Toast } from "primereact/toast";
import React, { useRef } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TableColumn } from "../../components/datatable/TableColumns";
import AddPageButton from "../../components/buttons/AddPageButton";
import ListTemplate from "../../templates/list/ListTemplate";
import SelectSizeDropdown, {
  SelectSizeDropdownOptions,
} from "../../components/dropdowns/SelectSizeDropdown";
import {
  CASE_DESIGNER_API,
  GetBookcasesResp,
} from "../../apis/casedesigner/CaseDesignerAPI";
import { APIToInternalBookcaseConversion } from "../../apis/casedesigner/CaseDesignerConversions";
import { DateTimeTemplate } from "../../components/templates/DateTemplate";

export interface Bookcase {
  id: string;
  name: string;
  width: number;
  creator: string;
  lastEditDate: Date;
  lastEditor: string;
  shelves: Shelf[];
}

export interface Shelf {
  id: string;
  displayedBooks: DisplayBook[];
  shelfSpace: number;
}

export interface DisplayBook {
  id: string;
  bookId: string;
  bookISBN: string;
  bookTitle: string;
  bookImageURL: string;
  displayMode: DisplayMode;
  displayCount: number;
  stock: number;
  shelfSpace: number;
  hasUnknownDimensions: boolean;
  maxDisplayCount?: number; // Only for cover out
}

export default function BookcaseList() {
  const COLUMNS: TableColumn<Bookcase>[] = [
    {
      field: "name",
      header: "Bookcase name",
    },
    {
      field: "creator",
      header: "Creator",
    },
    {
      field: "lastEditor",
      header: "Last Editor",
    },
    {
      field: "lastEditDate",
      header: "Last Edit Date",
      customBody: (rowData: Bookcase) => DateTimeTemplate(rowData.lastEditDate),
    },
  ];

  // ----------------- STATE -----------------
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false); // Whether we show that the table is loading or not
  const [numberOfBookcases, setNumberOfBookcases] = useState<number>(0); // The number of elements that match the query
  const [bookcases, setBookcases] = useState<Bookcase[]>([]); // The data displayed in the table
  const [isNoPagination, setIsNoPagination] = useState<boolean>(false);
  const [tableWhitespaceSize, setTableWhitespaceSize] =
    useState<SelectSizeDropdownOptions>(SelectSizeDropdownOptions.Small);

  // ----------------- METHODS -----------------

  // Calls the Bookcases API
  const callAPI = (page: number, pageSize: number) => {
    CASE_DESIGNER_API.getBookcases({
      page: page,
      page_size: pageSize,
    }).then((response) => onAPIResponse(response));
  };

  // Set state when response to API call is received
  const onAPIResponse = (response: GetBookcasesResp) => {
    setBookcases(
      response.results.map((Bookcase) =>
        APIToInternalBookcaseConversion(Bookcase)
      )
    );
    setNumberOfBookcases(response.count);
    setIsLoading(false);
  };

  // ----------------- TEMPLATES/VISIBLE COMPONENTS -----------------
  const toast = useRef<Toast>(null);

  const addBookcaseButton = (
    <AddPageButton
      onClick={() => navigate("/bookcases/add")}
      label="Add Bookcase"
      className="mr-2"
    />
  );

  const selectSizeButton = (
    <SelectSizeDropdown
      value={tableWhitespaceSize}
      onChange={(e) => setTableWhitespaceSize(e.value)}
    />
  );

  const dataTable = (
    <ListTemplate
      columns={COLUMNS}
      detailPageURL="/bookcases/detail/"
      whitespaceSize={tableWhitespaceSize}
      isNoPagination={isNoPagination}
      setIsNoPagination={setIsNoPagination}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
      totalNumberOfEntries={numberOfBookcases}
      setTotalNumberOfEntries={setNumberOfBookcases}
      rows={bookcases}
      APISortFieldMap={new Map()}
      callGetAPI={callAPI}
      paginatorLeft={<></>}
      paginatorRight={
        <div className="flex justify-content-center">{selectSizeButton}</div>
      }
    />
  );

  return (
    <div>
      <div className="flex justify-content-end">
        <div className="card col-9 pt-0 px-3 justify-content-center">
          <Toast ref={toast} />
          {dataTable}
        </div>
        <div
          className="flex justify-content-end align-items-start mr-1 my-2"
          style={{ width: "12.4%" }}
        >
          {addBookcaseButton}
        </div>
      </div>
    </div>
  );
}
