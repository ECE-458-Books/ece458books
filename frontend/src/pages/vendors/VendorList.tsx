import { Toast } from "primereact/toast";
import React from "react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  APIToInternalVendorConversion,
  APIVendorSortFieldMap,
} from "../../apis/vendors/VendorsConversions";
import {
  APIVendor,
  GetVendorsResp,
  VENDORS_API,
} from "../../apis/vendors/VendorsAPI";
import { TableColumn } from "../../components/datatable/TableColumns";
import PercentTemplate from "../../components/templates/PercentTemplate";
import AddPageButton from "../../components/buttons/AddPageButton";
import LabeledSwitch from "../../components/buttons/LabeledSwitch";
import ListTemplate from "../../templates/list/ListTemplate";
import SelectSizeDropdown, {
  SelectSizeDropdownOptions,
} from "../../components/buttons/SelectSizeDropdown";
import { scrollToTop } from "../../util/WindowViewportOps";

// The Vendor Interface
export interface Vendor {
  id: string;
  name: string;
  buybackRate?: number;
  numPO: number;
}

// Properties of each column that change, the rest are set below when creating the actual Columns to be rendered
const COLUMNS: TableColumn<Vendor>[] = [
  {
    field: "name",
    header: "Vendor Name",
    sortable: true,
    style: { minWidth: "8rem", width: "16rem" },
  },
  {
    field: "buybackRate",
    header: "Buyback Rate",
    sortable: true,
    customBody: (rowData: Vendor) =>
      rowData.buybackRate ? PercentTemplate(rowData.buybackRate) : undefined,
    style: { minWidth: "8rem", width: "12rem" },
  },
];

export default function VendorList() {
  // ----------------- STATE -----------------
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false); // Whether we show that the table is loading or not
  const [numberOfVendors, setNumberOfVendors] = useState<number>(0); // The number of elements that match the query
  const [vendors, setVendors] = useState<Vendor[]>([]); // The data displayed in the table
  const [isNoPagination, setIsNoPagination] = useState<boolean>(false);
  const [tableWhitespaceSize, setTableWhitespaceSize] =
    useState<SelectSizeDropdownOptions>(SelectSizeDropdownOptions.Small);

  // ----------------- METHODS -----------------

  // Calls the Vendors API
  const callAPI = (page: number, pageSize: number, sortField: string) => {
    if (!isNoPagination) {
      VENDORS_API.getVendors({
        page: page,
        page_size: pageSize,
        ordering: sortField,
      }).then((response) => onAPIResponse(response));
    } else {
      VENDORS_API.getVendorsNoPaginationLISTVIEW({
        no_pagination: true,
        ordering: sortField,
      }).then((response) => onAPIResponseNoPagination(response));
    }
  };

  // Set state when response to API call is received
  const onAPIResponseNoPagination = (response: APIVendor[]) => {
    setVendors(response.map((vendor) => APIToInternalVendorConversion(vendor)));
    setNumberOfVendors(response.length);
    setIsLoading(false);
  };

  // Set state when response to API call is received
  const onAPIResponse = (response: GetVendorsResp) => {
    setVendors(
      response.results.map((vendor) => APIToInternalVendorConversion(vendor))
    );
    setNumberOfVendors(response.count);
    setIsLoading(false);
  };

  // ----------------- TEMPLATES/VISIBLE COMPONENTS -----------------
  const toast = useRef<Toast>(null);

  const addVendorButton = (
    <AddPageButton
      onClick={() => navigate("/vendors/add")}
      label="Add Vendor"
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
      detailPageURL="/vendors/detail/"
      whitespaceSize={tableWhitespaceSize}
      isNoPagination={isNoPagination}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
      totalNumberOfEntries={numberOfVendors}
      setTotalNumberOfEntries={setNumberOfVendors}
      rows={vendors}
      APISortFieldMap={APIVendorSortFieldMap}
      callGetAPI={callAPI}
      paginatorLeft={
        <div className="flex justify-content-center">{noPaginationSwitch}</div>
      }
      paginatorRight={
        <div className="flex justify-content-center">{selectSizeButton}</div>
      }
    />
  );

  return (
    <div>
      {isNoPagination && (
        <div className="grid flex m-1 justify-content-end">
          <div className="flex col-4 justify-content-start m-0 my-auto">
            {noPaginationSwitch}
          </div>
          <div className="flex col-4 justify-content-end m-0">
            {selectSizeButton}
          </div>
          <div className="flex justify-content-end col-2">
            {addVendorButton}
          </div>
        </div>
      )}
      <div
        className={
          !isNoPagination
            ? "flex justify-content-end"
            : "flex justify-content-center"
        }
      >
        <div className="card col-9 pt-0 px-3 justify-content-center">
          <Toast ref={toast} />
          {dataTable}
        </div>
        {!isNoPagination && (
          <div
            className="flex justify-content-end align-items-start mr-1 my-2"
            style={{ width: "12.4%" }}
          >
            {addVendorButton}
          </div>
        )}
      </div>
    </div>
  );
}
