import { useRef, useState } from "react";
import { logger } from "../../util/Logger";
import { Toast } from "primereact/toast";
import { useNavigate } from "react-router-dom";
import { showFailure } from "../../components/Toast";
import { DataTable } from "primereact/datatable";
import {
  TableColumn,
  createColumns,
} from "../../components/datatable/TableColumns";
import { PercentEditor } from "../../components/editors/PercentEditor";
import { TextEditor } from "../../components/editors/TextEditor";
import { filterById, findById } from "../../util/IDOps";
import { useImmer } from "use-immer";
import React from "react";
import { v4 as uuid } from "uuid";
import ConfirmPopup from "../../components/popups/ConfirmPopup";
import { Toolbar } from "primereact/toolbar";
import { VENDORS_API, AddVendorReq } from "../../apis/vendors/VendorsAPI";
import axios from "axios";
import AddRowButton from "../../components/buttons/AddRowButton";
import BackButton from "../../components/buttons/BackButton";
import DeleteColumn from "../../components/datatable/DeleteColumn";

export interface VendorRow {
  id: string;
  vendorName: string;
  buybackRate: number | undefined;
}

export default function GenreAdd() {
  const emptyVendor: VendorRow = {
    id: uuid(),
    vendorName: "",
    buybackRate: undefined,
  };

  const [vendors, setVendors] = useImmer<VendorRow[]>([]);
  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] =
    useState<boolean>(false);
  const [isGoBackActive, setIsGoBackActive] = useState<boolean>(false);

  const COLUMNS: TableColumn<VendorRow>[] = [
    {
      field: "vendorName",
      header: "Vendor Name",
      customBody: (rowData: VendorRow) =>
        TextEditor(rowData.vendorName, (newValue) => {
          setVendors((draft) => {
            const vendor = findById(draft, rowData.id);
            vendor!.vendorName = newValue;
          });
        }),
    },
    {
      field: "buybackRate",
      header: "Buyback Rate (%)",
      customBody: (rowData: VendorRow) =>
        PercentEditor(rowData.buybackRate, (newValue) => {
          setVendors((draft) => {
            const vendor = findById(draft, rowData.id);
            vendor!.buybackRate = newValue;
          });
        }),
    },
  ];

  // The navigator to switch pages
  const navigate = useNavigate();

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  const onSubmit = (): void => {
    logger.debug("Add Vendor Submitted", vendors);
    const vendorRequests = vendors.map((vendor: VendorRow) => {
      const newVendor: AddVendorReq = {
        name: vendor.vendorName,
        buyback_rate: vendor.buybackRate,
      };
      VENDORS_API.addVendor(newVendor);
    });

    axios
      .all(vendorRequests)
      .then(() => {
        isGoBackActive ? navigate("/vendors") : window.location.reload();
      })
      .catch(() => {
        showFailure(toast, "One or more of the vendors failed to add");
      });
  };

  const addRowButton = (
    <AddRowButton
      emptyItem={emptyVendor}
      rows={vendors}
      setRows={setVendors}
      label={"Add Vendor"}
    />
  );

  const leftToolbar = <>{addRowButton}</>;

  // Right
  const submitButton = (
    <ConfirmPopup
      isPopupVisible={isConfirmationPopupVisible}
      hideFunc={() => setIsConfirmationPopupVisible(false)}
      onFinalSubmission={onSubmit}
      onShowPopup={() => setIsConfirmationPopupVisible(true)}
      label={"Submit"}
      className="p-button-success ml-2"
    />
  );

  const submitAndGoBackButton = (
    <ConfirmPopup
      isPopupVisible={isConfirmationPopupVisible}
      hideFunc={() => setIsConfirmationPopupVisible(false)}
      onFinalSubmission={onSubmit}
      onRejectFinalSubmission={() => {
        setIsGoBackActive(false);
      }}
      onShowPopup={() => {
        setIsConfirmationPopupVisible(true);
        setIsGoBackActive(true);
      }}
      label={"Submit and Go Back"}
      className="p-button-success ml-2"
    />
  );

  const rightToolbar = (
    <>
      {submitAndGoBackButton}
      {submitButton}
    </>
  );

  const backButton = (
    <div className="flex col-1">
      <BackButton onClick={() => navigate("/vendors")} className="ml-1" />
    </div>
  );

  // Delete icon for each row
  const deleteColumn = DeleteColumn<VendorRow>({
    onDelete: (rowData) => {
      filterById(vendors, rowData.id, setVendors);
    },
    hidden: false,
  });

  const columns = createColumns(COLUMNS);

  return (
    <div className="grid flex justify-content-center">
      <Toast ref={toast} />
      <div className="flex col-12 p-0">
        {backButton}
        <div className="pt-2 col-10">
          <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
            Add Vendors
          </h1>
        </div>
      </div>
      <div className="col-11">
        <form onSubmit={onSubmit}>
          <Toolbar className="mb-4" left={leftToolbar} right={rightToolbar} />

          <DataTable
            showGridlines
            value={vendors}
            className="editable-cells-table"
            responsiveLayout="scroll"
            editMode="cell"
          >
            {columns}
            {deleteColumn}
          </DataTable>
        </form>
      </div>
    </div>
  );
}
