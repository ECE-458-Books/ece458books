import BooksDropdown from "../../../components/dropdowns/BookDropdown";
import DisplayModeDropdown, {
  DisplayMode,
} from "../../../components/dropdowns/DisplayModeDropdown";
import { DisplayBook } from "../BookcaseList";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Updater } from "use-immer";
import DeleteButton from "../../../components/buttons/DeleteButton";
import TextLabel from "../../../components/text/TextLabels";
import { Book } from "../../books/BookList";
import {
  updateDisplayBookOnCountChange,
  updateDisplayBookOnModeChange,
  updateDisplayBookOnTitleChange,
} from "../util/Updaters";
import { IntegerEditor } from "../../../components/editors/IntegerEditor";

export interface AddEditDeleteDisplayBookPopupProps {
  isAddPopup: boolean;
  booksDropdownTitles: string[];
  booksMap: Map<string, Book>;
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
        updateDisplayBookOnTitleChange(
          props.setSelectedDisplayBook,
          props.selectedDisplayBook,
          newValue,
          props.booksMap
        )
      }
      selectedBook={props.selectedDisplayBook?.bookTitle ?? ""}
      bookTitlesList={props.booksDropdownTitles}
      placeholder={"Select a book"}
    />
  );

  const displayModeDropdown = (
    <DisplayModeDropdown
      setSelectedDisplayMode={(newValue) =>
        updateDisplayBookOnModeChange(
          props.setSelectedDisplayBook,
          props.selectedDisplayBook,
          newValue,
          props.booksMap
        )
      }
      selectedDisplayMode={
        props.selectedDisplayBook?.displayMode ?? DisplayMode.SPINE_OUT
      }
    />
  );

  const numberEditor = IntegerEditor(
    props.selectedDisplayBook?.displayCount ?? 0,
    (newValue) =>
      updateDisplayBookOnCountChange(
        props.setSelectedDisplayBook,
        props.selectedDisplayBook,
        newValue,
        props.booksMap
      ),
    "",
    false,
    0,
    props.selectedDisplayBook.maxDisplayCount
  );

  const deleteButton = (
    <DeleteButton
      onClick={() => {
        props.deleteBookFromShelf();
        props.setIsVisible(false);
      }}
      visible={!props.isAddPopup}
      className={"mr-2 "}
      disableUserRestriction={true}
    />
  );

  const addSaveButton = (
    <Button
      type="button"
      label={props.isAddPopup ? "Add" : "Save"}
      onClick={() => {
        if (props.isAddPopup) {
          props.addBookToShelf();
        } else {
          props.editBookOnShelf();
        }
        props.setIsVisible(false);
      }}
      disabled={props.selectedDisplayBook.bookTitle === ""}
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
      <div className="flex col-12 justify-content-start p-1">
        <TextLabel label={"Book Stock:"} />
        <p className="p-component p-text-secondary text-900 text-xl text-center m-0">
          {props.selectedDisplayBook.stock}
        </p>
      </div>
      <div className="flex col-12 justify-content-end p-0">
        {deleteButton}
        {addSaveButton}
      </div>
    </Dialog>
  );
}
