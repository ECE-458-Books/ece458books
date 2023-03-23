import BooksDropdown from "../../../components/dropdowns/BookDropdown";
import DisplayModeDropdown, {
  DisplayMode,
} from "../../../components/dropdowns/DisplayModeDropdown";
import { NumberEditor } from "../../../components/editors/NumberEditor";
import { DisplayBook } from "../BookcaseList";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Updater } from "use-immer";
import DeleteButton from "../../../components/buttons/DeleteButton";
import TextLabel from "../../../components/text/TextLabels";

export interface AddEditDeleteDisplayBookPopupProps {
  isAddPopup: boolean;
  booksDropdownTitles: string[];
  addBookToShelf: () => void;
  editBookOnShelf: () => void;
  deleteBookFromShelf: () => void;
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  selectedDisplayBook: DisplayBook;
  setSelectedDisplayBook: Updater<DisplayBook>;
}

export default function AddEditDeleteDisplayBookPopup(
  props: AddEditDeleteDisplayBookPopupProps
) {
  const booksDropdown = (
    <BooksDropdown
      setSelectedBook={(newValue) =>
        props.setSelectedDisplayBook((draft) => {
          draft.bookTitle = newValue;
        })
      }
      selectedBook={props.selectedDisplayBook?.bookTitle ?? ""}
      bookTitlesList={props.booksDropdownTitles}
      placeholder={"Select a book"}
    />
  );

  const displayModeDropdown = (
    <DisplayModeDropdown
      setSelectedDisplayMode={(newValue) =>
        props.setSelectedDisplayBook((draft) => {
          draft.displayMode = newValue;
        })
      }
      selectedDisplayMode={
        props.selectedDisplayBook?.displayMode ?? DisplayMode.SPINE_OUT
      }
    />
  );

  const numberEditor = NumberEditor(
    props.selectedDisplayBook?.displayCount ?? 1,
    (newValue) =>
      props.setSelectedDisplayBook((draft) => {
        draft.displayCount = newValue;
      })
  );

  const deleteButton = (
    <DeleteButton
      onClick={() => {
        props.deleteBookFromShelf();
        props.setIsVisible(false);
      }}
      visible={!props.isAddPopup}
      className={"ml-1 "}
    />
  );

  const addSaveButton = (
    <Button
      type="button"
      label={props.isAddPopup ? "Add" : "Save"}
      icon="pi pi-plus"
      onClick={() => {
        if (props.isAddPopup) {
          props.addBookToShelf();
        } else {
          props.editBookOnShelf();
        }
        props.setIsVisible(false);
      }}
      iconPos="right"
      className={"p-button-sm"}
    />
  );

  return (
    <Dialog
      header={props.isAddPopup ? "Add Display Book" : "Edit Display Book"}
      visible={props.isVisible}
      onHide={() => props.setIsVisible(false)}
    >
      <div className="flex col-12 justify-content-start p-1">
        <TextLabel label={"Book:"} />
        {booksDropdown}
      </div>
      <div className="flex col-12 justify-content-start p-1">
        <TextLabel label={"Display Mode:"} />
        {displayModeDropdown}
      </div>
      <div className="flex col-12 justify-content-start p-1">
        <TextLabel label={"Display Count:"} />
        {numberEditor}
      </div>
      <div className="flex col-12 p-0">
        <div className="flex col-6 justify-content-end p-1">
          <div className="flex p-0 col-6">{deleteButton}</div>
          <div className="flex p-0 col-6">{addSaveButton}</div>
        </div>
      </div>
    </Dialog>
  );
}
