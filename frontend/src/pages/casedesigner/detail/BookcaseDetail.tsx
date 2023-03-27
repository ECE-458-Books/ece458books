import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import React from "react";
import ConfirmPopup from "../../../components/popups/ConfirmPopup";
import { showFailure, showSuccess } from "../../../components/Toast";
import { useImmer } from "use-immer";
import { logger } from "../../../util/Logger";
import DeletePopup from "../../../components/popups/DeletePopup";
import AddDetailModifyTitle from "../../../components/text/AddDetailModifyTitle";
import BackButton from "../../../components/buttons/BackButton";
import DeleteButton from "../../../components/buttons/DeleteButton";
import AddRowButton from "../../../components/buttons/AddRowButton";
import EditCancelButton from "../../../components/buttons/EditCancelDetailButton";
import "../../../css/TableCell.css";
import Restricted from "../../../permissions/Restricted";
import { Bookcase, Shelf } from "../BookcaseList";
import { CASE_DESIGNER_API } from "../../../apis/casedesigner/CaseDesignerAPI";
import {
  APIToInternalBookcaseConversion,
  InternalToAPIBookcaseConversion,
} from "../../../apis/casedesigner/CaseDesignerConversions";
import BookcaseDetailTable from "./BookcaseDetailTable";
import TextLabel from "../../../components/text/TextLabels";
import { NumberEditor } from "../../../components/editors/NumberEditor";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { TextEditor } from "../../../components/editors/TextEditor";
import { v4 as uuid } from "uuid";

const emptyShelf: Shelf = {
  id: "",
  displayedBooks: [],
  shelfSpace: 0,
};

const emptyBookcase: Bookcase = {
  id: "",
  name: "",
  width: 60,
  creator: "",
  lastEditDate: new Date(),
  lastEditor: "",
  // Default to 7 empty shelves for an add page
  shelves: Array(7)
    .fill(undefined)
    .map(() => {
      const shelf = { ...emptyShelf };
      shelf.id = uuid();
      return shelf;
    }),
};

export default function BookcaseDetail() {
  const navigate = useNavigate();
  // -------- STATE --------
  // From URL
  let { id } = useParams();
  const isAddPage = id === undefined;
  const [isModifiable, setIsModifiable] = useState<boolean>(id === undefined);

  const [originalData, setOriginalData] = useState<Bookcase>(emptyBookcase);

  const [bookcase, setBookcase] = useImmer<Bookcase>(emptyBookcase);
  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] =
    useState<boolean>(false);
  const [isDeletePopupVisible, setIsDeletePopupVisible] =
    useState<boolean>(false);
  const [isSaveAsPopupVisible, setIsSaveAsPopupVisible] =
    useState<boolean>(false);
  const [bookcaseNameInSaveAsPopup, setBookcaseNameInSaveAsPopup] =
    useState<string>("");

  // Load the Bookcase data on page load
  useEffect(() => {
    if (!isAddPage) {
      CASE_DESIGNER_API.getBookcaseDetail(id!)
        .then((response) => {
          const bookcase = APIToInternalBookcaseConversion(response);
          setOriginalData(bookcase);
          setBookcase(bookcase);
          setBookcaseNameInSaveAsPopup(bookcase.name);
        })
        .catch(() => showFailure(toast, "Could not fetch bookcase data"));
    }
  }, []);

  // Call to delete the bookcase
  const deleteBookcaseFinal = () => {
    logger.debug("Delete Bookcase Finalized");
    setIsDeletePopupVisible(false);
    CASE_DESIGNER_API.deleteBookcase(id!)
      .then(() => {
        showSuccess(toast, "Bookcase deleted");
        navigate("/bookcases");
      })
      .catch(() => showFailure(toast, "Failed to delete bookcase"));
  };

  const callAddBookcaseAPI = () => {
    const APIbookcase = InternalToAPIBookcaseConversion(bookcase);
    APIbookcase.name = bookcaseNameInSaveAsPopup;
    CASE_DESIGNER_API.addBookcase(APIbookcase)
      .then((response) => {
        showSuccess(toast, "Bookcase added successfully");
        setIsModifiable(!isModifiable);
        setBookcase((draft) => {
          draft.name = bookcaseNameInSaveAsPopup;
        });
        setOriginalData(APIToInternalBookcaseConversion(response));
        id = response.id!.toString();
        navigate("/bookcases/detail/" + response.id);
      })
      .catch((error) => {
        console.log(error);
        const bookcaseNotUnique = error.data.errors?.name?.[0];
        showFailure(
          toast,
          bookcaseNotUnique
            ? "Bookcase not saved, name is not unique"
            : "Failed to save bookcase"
        );
      });
  };

  const callModifyBookcaseAPI = () => {
    const APIbookcase = InternalToAPIBookcaseConversion(bookcase);
    APIbookcase.id = Number(id);
    CASE_DESIGNER_API.modifyBookcase(APIbookcase)
      .then(() => {
        showSuccess(toast, "Bookcase modified successfully");
        setIsModifiable(!isModifiable);
        setOriginalData(bookcase);
      })
      .catch((error) => {
        console.log(error);
        const bookcaseNotUnique = error.data.errors?.name?.[0];
        showFailure(
          toast,
          bookcaseNotUnique
            ? "Bookcase not saved, name is not unique"
            : "Failed to save bookcase"
        );
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
      <Button
        type="button"
        label="Back"
        icon="pi pi-arrow-left"
        onClick={() => navigate("/bookcases")}
        className={"p-button-sm my-auto ml-1"}
      />
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
      disableUserRestriction={true}
    />
  );

  const deleteButton = (
    <DeleteButton
      visible={!isAddPage}
      onClick={() => setIsDeletePopupVisible(true)}
      disableUserRestriction={true}
    />
  );

  const deletePopup = (
    <DeletePopup
      deleteItemIdentifier={"this bookcase"}
      onConfirm={() => deleteBookcaseFinal()}
      setIsVisible={setIsDeletePopupVisible}
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
  const saveButton = (
    <ConfirmPopup
      isButtonVisible={isModifiable && !isAddPage}
      isPopupVisible={isConfirmationPopupVisible}
      onHide={() => setIsConfirmationPopupVisible(false)}
      onFinalSubmission={callModifyBookcaseAPI}
      onShowPopup={() => setIsConfirmationPopupVisible(true)}
      disabled={!isModifiable}
      buttonLabel={"Save"}
      className="p-button-success ml-2"
      icons={"pi pi-save"}
    />
  );

  const saveAsButton = (
    <Button
      id={"enterfinalsubmission"}
      type="button"
      onClick={() => setIsSaveAsPopupVisible(true)}
      disabled={!isModifiable}
      label={"Save As"}
      className="p-button-success ml-2"
      icon={"pi pi-save"}
    />
  );

  const saveAsDialog = (
    <Dialog
      onHide={() => setIsSaveAsPopupVisible(false)}
      visible={isSaveAsPopupVisible}
      header={"Save As"}
    >
      <div className="flex col-12 justify-content-start p-1">
        <TextLabel label={"Name: "} />
        <p className="p-component p-text-secondary text-900 text-xl text-center m-0">
          {TextEditor(bookcaseNameInSaveAsPopup, (newValue) =>
            setBookcaseNameInSaveAsPopup(newValue)
          )}
        </p>
      </div>
      <div className="flex col-12 justify-content-end p-1">
        <Button
          type="button"
          label={"Save"}
          onClick={() => {
            callAddBookcaseAPI();
            setIsSaveAsPopupVisible(false);
          }}
          iconPos="right"
          className={"p-button-sm"}
        />
      </div>
    </Dialog>
  );

  const rightToolbar = (
    <div className="flex justify-content-end">
      {saveAsButton}
      {saveButton}
    </div>
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

  const bookcaseName = (
    <div className="flex">
      {!isAddPage && (
        <>
          <TextLabel label={"Name: "} />
          <p className="p-component p-text-secondary text-900 text-xl text-center my-auto">
            {bookcase.name}
          </p>
        </>
      )}
    </div>
  );

  const widthEditor = (
    <div className="flex">
      <TextLabel label={"Width (in): "} />
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
    </div>
  );

  const tableHeader = (
    <Restricted to={"modify"}>
      <div className="flex">{addRowButton}</div>
    </Restricted>
  );

  // Datatable
  const dataTable = (
    <BookcaseDetailTable
      shelves={bookcase.shelves}
      shelfWidth={bookcase.width}
      setBookcase={setBookcase}
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
          <div className="flex col-12 justify-content-evenly mb-3">
            {bookcaseName}
            {widthEditor}
            {isModifiable && rightToolbar}
          </div>
          {dataTable}
        </div>
        {isDeletePopupVisible && deletePopup}
        {saveAsDialog}
      </div>
    </div>
  );
}
