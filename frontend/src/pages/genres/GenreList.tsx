import { Toast } from "primereact/toast";
import React, { useRef } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  APIGenreSortFieldMap,
  APIToInternalGenreConversion,
} from "../../apis/genres/GenresConversions";
import {
  APIGenre,
  GENRES_API,
  GetGenresResp,
} from "../../apis/genres/GenresAPI";
import { TableColumn } from "../../components/datatable/TableColumns";
import { logger } from "../../util/Logger";
import AddPageButton from "../../components/buttons/AddPageButton";
import LabeledSwitch from "../../components/buttons/LabeledSwitch";
import { Button } from "primereact/button";
import ListTemplate from "../../templates/list/ListTemplate";
import SelectSizeDropdown, {
  SelectSizeDropdownOptions,
} from "../../components/buttons/SelectSizeDropdown";
import { scrollToTop } from "../../util/WindowViewportOps";

export interface Genre {
  id: string;
  name: string;
  bookCount: number;
}

export default function GenreList() {
  const COLUMNS: TableColumn<Genre>[] = [
    {
      field: "name",
      header: "Genre",
      sortable: true,
      style: { minWidth: "8rem", width: "16rem" },
    },
    {
      field: "bookCount",
      header: "Number of Books",
      sortable: true,
      style: { minWidth: "8rem", width: "12rem" },
    },
    {
      field: "none",
      header: "To Book List",
      customBody: (rowData: Genre) => bookFilteredList(rowData),
      style: { width: "3rem", padding: "2" },
    },
  ];

  // ----------------- STATE -----------------
  const [isLoading, setIsLoading] = useState<boolean>(false); // Whether we show that the table is loading or not
  const [numberOfGenres, setNumberOfGenres] = useState<number>(0); // The number of elements that match the query
  const [genres, setGenres] = useState<Genre[]>([]); // The data displayed in the table
  const [isNoPagination, setIsNoPagination] = useState<boolean>(false);
  const [tableWhitespaceSize, setTableWhitespaceSize] =
    useState<SelectSizeDropdownOptions>(SelectSizeDropdownOptions.Small);

  // ----------------- METHODS -----------------
  // Navigator used to go to a different page
  const navigate = useNavigate();

  // Callback functions for edit/delete buttons
  const goToFilteredBookList = (genre: Genre) => {
    logger.debug("Genre Row Clicked", genre);
    navigate("/books", { state: { genre: genre.name } });
  };

  // Calls the Genres API
  const callAPI = (page: number, pageSize: number, sortField: string) => {
    if (!isNoPagination) {
      GENRES_API.getGenres({
        page: page,
        page_size: pageSize,
        ordering: sortField,
      }).then((response) => onAPIResponse(response));
    } else {
      GENRES_API.getGenresNoPaginationLISTVIEW({
        no_pagination: true,
        ordering: sortField,
      }).then((response) => onAPIResponseNoPagination(response));
    }
  };

  const onAPIResponseNoPagination = (response: APIGenre[]) => {
    setGenres(response.map((genre) => APIToInternalGenreConversion(genre)));
    setNumberOfGenres(response.length);
    setIsLoading(false);
  };

  // Set state when response to API call is received
  const onAPIResponse = (response: GetGenresResp) => {
    setGenres(
      response.results.map((genre) => APIToInternalGenreConversion(genre))
    );
    setNumberOfGenres(response.count);
    setIsLoading(false);
  };

  // ----------------- TEMPLATES/VISIBLE COMPONENTS -----------------

  const bookFilteredList = (rowData: Genre) => {
    return (
      <>
        <div className="flex justify-content-center">
          <Button
            icon="pi pi-align-justify"
            className="p-button-rounded p-button-info"
            style={{ height: 40, width: 40 }}
            onClick={() => goToFilteredBookList(rowData)}
          />
        </div>
      </>
    );
  };

  const toast = useRef<Toast>(null);

  const addGenreButton = (
    <AddPageButton
      onClick={() => navigate("/genres/add")}
      label="Add Genre"
      className="mr-2"
    />
  );

  const noPaginationSwitch = (
    <LabeledSwitch
      label="Show All"
      onChange={() => {
        if (!isNoPagination) {
          scrollToTop();
        }
        setIsNoPagination(!isNoPagination);
      }}
      value={isNoPagination}
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
      detailPageURL={"/genres/detail/"}
      whitespaceSize={tableWhitespaceSize}
      isNoPagination={isNoPagination}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
      totalNumberOfEntries={numberOfGenres}
      setTotalNumberOfEntries={setNumberOfGenres}
      rows={genres}
      APISortFieldMap={APIGenreSortFieldMap}
      callGetAPI={callAPI}
      paginatorLeft={noPaginationSwitch}
      paginatorRight={selectSizeButton}
    />
  );

  return (
    <div>
      {isNoPagination && (
        <div className="grid flex justify-content-end m-1">
          <div className="flex col-4 justify-content-start m-0 my-auto">
            {noPaginationSwitch}
          </div>
          <div className="flex col-4 justify-content-end m-0 mr-3">
            {selectSizeButton}
          </div>
          <div className="flex justify-content-end col-2">{addGenreButton}</div>
        </div>
      )}
      <div
        className={
          !isNoPagination
            ? "flex justify-content-end"
            : "flex justify-content-center"
        }
      >
        <div className="card col-9 pt-0 px-3 justify-content-center;">
          <Toast ref={toast} />
          {dataTable}
        </div>
        {!isNoPagination && (
          <div
            className="flex justify-content-end align-items-start mr-1 my-2"
            style={{ width: "12.4%" }}
          >
            {addGenreButton}
          </div>
        )}
      </div>
    </div>
  );
}
