import { Toast } from "primereact/toast";
import React from "react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  APIToInternalVendorConversion,
  APIVendorSortFieldMap,
} from "../../apis/vendors/VendorsConversions";
import { GetVendorsResp, VENDORS_API } from "../../apis/vendors/VendorsAPI";
import { TableColumn } from "../../components/datatable/TableColumns";
import PercentTemplate from "../../components/templates/PercentTemplate";
import AddPageButton from "../../components/buttons/AddPageButton";
import ListTemplate from "../../templates/list/ListTemplate";
import SelectSizeDropdown, {
  SelectSizeDropdownOptions,
} from "../../components/dropdowns/SelectSizeDropdown";
import { showFailure } from "../../components/Toast";

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
    VENDORS_API.getVendors({
      page: page,
      page_size: pageSize,
      ordering: sortField,
    })
      .then((response) => onAPIResponse(response))
      .catch(() => showFailure(toast, "Vendor List Retrieval Error Occured"));
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
      setIsNoPagination={setIsNoPagination}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
      totalNumberOfEntries={numberOfVendors}
      setTotalNumberOfEntries={setNumberOfVendors}
      rows={vendors}
      APISortFieldMap={APIVendorSortFieldMap}
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
          {addVendorButton}
        </div>
      </div>
    </div>
  );
}
