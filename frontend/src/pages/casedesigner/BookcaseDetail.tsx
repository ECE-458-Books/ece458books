import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import React from "react";
import ConfirmPopup from "../../components/popups/ConfirmPopup";
import { showFailure, showSuccess } from "../../components/Toast";
import { Book } from "../books/BookList";

import { useImmer } from "use-immer";

import { BooksDropdownData } from "../../components/dropdowns/BookDropdown";
import { logger } from "../../util/Logger";
import DeletePopup from "../../components/popups/DeletePopup";
import AddDetailModifyTitle from "../../components/text/AddDetailModifyTitle";
import BackButton from "../../components/buttons/BackButton";
import DeleteButton from "../../components/buttons/DeleteButton";

import AddRowButton from "../../components/buttons/AddRowButton";
import EditCancelButton from "../../components/buttons/EditCancelDetailButton";

import "../../css/TableCell.css";
import Restricted from "../../permissions/Restricted";
import { Bookcase, Shelf } from "./BookcaseList";
import { CASE_DESIGNER_API } from "../../apis/casedesigner/CaseDesignerAPI";
import {
  APIToInternalBookcaseConversion,
  InternalToAPIBookcaseConversion,
} from "../../apis/casedesigner/CaseDesignerConversions";
import BookcaseDetailTable from "./BookcaseDetailTable";
import TextLabel from "../../components/text/TextLabels";
import { TextEditor } from "../../components/editors/TextEditor";
import { NumberEditor } from "../../components/editors/NumberEditor";

const emptyBookcase: Bookcase = {
  id: "",
  name: "",
  width: 0,
  creator: "",
  lastEditDate: new Date(),
  lastEditor: "",
  shelves: [],
};

const emptyShelf: Shelf = {
  id: "",
  displayedBooks: [],
};

export default function BookcaseDetail() {
  // -------- STATE --------
  // From URL
  const { id } = useParams();
  const isAddPage = id === undefined;
  const [isModifiable, setIsModifiable] = useState<boolean>(id === undefined);

  // The navigator to switch pages
  const navigate = useNavigate();

  // For dropdown menus
  const [booksMap, setBooksMap] = useState<Map<string, Book>>(new Map());
  const [bookTitlesList, setBookTitlesList] = useState<string[]>([]);
  const [originalData, setOriginalData] = useState<Bookcase>(emptyBookcase);

  // useImmer is used to set state for nested data in a simplified format
  const [bookcase, setBookcase] = useImmer<Bookcase>(emptyBookcase);
  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] =
    useState<boolean>(false);
  const [deletePopupVisible, setDeletePopupVisible] = useState<boolean>(false);
  const [isGoBackActive, setIsGoBackActive] = useState<boolean>(false);

  // Load the Bookcase data on page load
  useEffect(() => {
    if (!isAddPage) {
      CASE_DESIGNER_API.getBookcaseDetail(id)
        .then((response) => {
          const bookcase = APIToInternalBookcaseConversion(response);
          setOriginalData(bookcase);
          setBookcase(bookcase);
        })
        .catch(() => showFailure(toast, "Could not fetch bookcase data"));
    }
  }, []);

  // Get the data for the books dropdown
  useEffect(
    () =>
      BooksDropdownData({
        setBooksMap: setBooksMap,
        setBookTitlesList: setBookTitlesList,
      }),
    []
  );

  // Call to delete the bookcase
  const deleteBookcaseFinal = () => {
    logger.debug("Delete Bookcase Finalized");
    setDeletePopupVisible(false);
    CASE_DESIGNER_API.deleteBookcase(id!)
      .then(() => {
        showSuccess(toast, "Bookcase deleted");
        navigate("/bookcase");
      })
      .catch(() => showFailure(toast, "Failed to delete bookcase"));
  };

  const onSubmit = (): void => {
    if (isAddPage) {
      callAddBookcaseAPI();
    } else {
      callModifyBookcaseAPI();
    }
  };

  const callAddBookcaseAPI = () => {
    const APIbookcase = InternalToAPIBookcaseConversion(bookcase);
    CASE_DESIGNER_API.addBookcase(APIbookcase)
      .then(() => {
        showSuccess(toast, "Bookcase added successfully");
        isGoBackActive ? navigate("/bookcases") : window.location.reload();
      })
      .catch((error) => {
        showFailure(toast, error.data.errors[0] ?? "Failed to add bookcase");
      });
  };

  const callModifyBookcaseAPI = () => {
    const APIbookcase = InternalToAPIBookcaseConversion(bookcase);
    CASE_DESIGNER_API.modifyBookcase(APIbookcase)
      .then(() => {
        showSuccess(toast, "Bookcase modified successfully");
        isGoBackActive ? navigate("/bookcases") : window.location.reload();
      })
      .catch((error) => {
        showFailure(toast, error.data.errors[0] ?? "Failed to add bookcase");
      });
  };

  const setShelves = (shelves: Shelf[]) => {
    setBookcase((draft) => {
      draft.shelves = shelves;
    });
  };

  // -------- TEMPLATES/VISUAL ELEMENTS --------
  const toast = useRef<Toast>(null);

  // Top Line
  const titleText = (
    <div className="pt-2 col-4">
      <AddDetailModifyTitle
        isModifyPage={isModifiable}
        isAddPage={isAddPage}
        detailTitle={"Bookcase Details"}
        addTitle={"Add Bookcase"}
        modifyTitle={"Modify Bookcase"}
      />
    </div>
  );

  const backButton = (
    <div className="flex col-4">
      <BackButton className="ml-1" />
    </div>
  );

  const editCancelButton = (
    <EditCancelButton
      onClickEdit={() => setIsModifiable(!isModifiable)}
      onClickCancel={() => {
        setIsModifiable(!isModifiable);
        setBookcase(originalData);
      }}
      isAddPage={isAddPage}
      isModifiable={isModifiable}
      className="my-auto p-button-sm mr-1"
    />
  );

  const deleteButton = (
    <DeleteButton
      visible={!isAddPage}
      onClick={() => setDeletePopupVisible(true)}
    />
  );

  const deletePopup = (
    <DeletePopup
      deleteItemIdentifier={"this bookcase"}
      onConfirm={() => deleteBookcaseFinal()}
      setIsVisible={setDeletePopupVisible}
    />
  );

  const rightButtons = (
    <div className="flex col-4 justify-content-end">
      {editCancelButton}
      {deleteButton}
    </div>
  );

  // Buttons/information that are right above the table

  // Right
  const submitButton = (
    <ConfirmPopup
      isButtonVisible={isModifiable}
      isPopupVisible={isConfirmationPopupVisible}
      hideFunc={() => setIsConfirmationPopupVisible(false)}
      onFinalSubmission={onSubmit}
      onShowPopup={() => setIsConfirmationPopupVisible(true)}
      disabled={!isModifiable}
      label={"Submit"}
      className="p-button-success ml-2"
    />
  );

  const submitAndGoBackButton = (
    <ConfirmPopup
      isButtonVisible={isModifiable && isAddPage}
      isPopupVisible={isConfirmationPopupVisible && isModifiable && isAddPage}
      hideFunc={() => setIsConfirmationPopupVisible(false)}
      onFinalSubmission={onSubmit}
      onRejectFinalSubmission={() => {
        setIsGoBackActive(false);
      }}
      onShowPopup={() => {
        setIsConfirmationPopupVisible(true);
        setIsGoBackActive(true);
      }}
      disabled={!isModifiable}
      label={"Submit and Go Back"}
      className="p-button-success ml-2"
    />
  );

  const rightToolbar = (
    <Restricted to={"modify"}>
      <div className="flex justify-content-end">
        {submitAndGoBackButton}
        {submitButton}
      </div>
    </Restricted>
  );

  // Components that are attached to the table
  const addRowButton = (
    <AddRowButton
      emptyItem={emptyShelf}
      rows={bookcase.shelves}
      setRows={setShelves}
      isDisabled={!isModifiable}
      label={"Add Shelf"}
      isVisible={isModifiable}
    />
  );

  const nameEditor = (
    <>
      <TextLabel label={"Name: "} />
      {isModifiable ? (
        TextEditor(bookcase.name, (newValue) => {
          setBookcase((draft) => {
            draft.name = newValue;
          });
        })
      ) : (
        <p className="p-component p-text-secondary text-900 text-xl text-center m-0">
          {bookcase.name}
        </p>
      )}
    </>
  );

  const widthEditor = (
    <>
      <TextLabel label={"Width: "} />
      {isModifiable ? (
        NumberEditor(bookcase.width, (newValue) => {
          setBookcase((draft) => {
            draft.width = newValue;
          });
        })
      ) : (
        <p className="p-component p-text-secondary text-900 text-xl text-center m-0">
          {bookcase.width}
        </p>
      )}
    </>
  );

  const tableHeader = (
    <Restricted to={"modify"}>
      <div className="flex">
        {addRowButton}
        {nameEditor}
        {widthEditor}
      </div>
    </Restricted>
  );

  // Datatable
  const dataTable = (
    <BookcaseDetailTable
      shelves={bookcase.shelves}
      setShelves={setShelves}
      booksDropdownTitles={bookTitlesList}
      isAddPage={isAddPage}
      isModifiable={isModifiable}
      tableHeader={tableHeader}
    />
  );

  return (
    <div>
      <Toast ref={toast} />
      <div className="grid flex justify-content-center">
        <div className="flex col-12 p-0">
          {backButton}
          {titleText}
          {rightButtons}
        </div>
        <div className="col-11">
          <form onSubmit={onSubmit}>
            <div className="flex col-12 justify-content-evenly mb-3">
              {isModifiable && rightToolbar}
            </div>
            {dataTable}
          </form>
        </div>
        {deletePopupVisible && deletePopup}
      </div>
    </div>
  );
}
