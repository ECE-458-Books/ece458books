import React, { FormEvent, useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import ConfirmButton from "../../components/popups/ConfirmPopup";
import { useNavigate, useParams } from "react-router-dom";
import { GENRES_API } from "../../apis/genres/GenresAPI";
import { Genre } from "./GenreList";
import { logger } from "../../util/Logger";
import { Toast } from "primereact/toast";
import { showFailure, showSuccess } from "../../components/Toast";
import { Button } from "primereact/button";
import DeletePopup from "../../components/popups/DeletePopup";
import BackButton from "../../components/buttons/BackButton";
import DeleteButton from "../../components/buttons/DeleteButton";
import Restricted from "../../permissions/Restricted";

export default function GenreDetail() {
  // From URL
  const { id } = useParams();
  const [isModifiable, setIsModifiable] = useState<boolean>(false);

  const [originalGenreName, setOriginalGenreName] = useState<string>("");

  const [genreName, setGenreName] = useState<string>("");
  const [genreBookCount, setGenreBookCount] = useState<number>(0);
  const [isConfirmationPopVisible, setIsConfirmationPopupVisible] =
    useState<boolean>(false);
  const [deletePopupVisible, setDeletePopupVisible] = useState<boolean>(false); // Whether the delete popup is shown

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  // Load the Genre data on page load
  useEffect(() => {
    GENRES_API.getGenreDetail({ id: id! })
      .then((response) => {
        setGenreName(response.name);
        setGenreBookCount(response.book_cnt);
        setOriginalGenreName(response.name);
      })
      .catch(() => showFailure(toast, "Could not fetch genre data"));
  }, []);

  // Called to make delete pop up show
  const deleteGenrePopup = () => {
    logger.debug("Delete Genre Clicked");
    setDeletePopupVisible(true);
  };

  // Call to actually delete the element
  const deleteGenreFinal = () => {
    logger.debug("Delete Genre Finalized");
    setDeletePopupVisible(false);
    GENRES_API.deleteGenre({ id: id! })
      .then(() => {
        showSuccess(toast, "Genre Deleted");
        navigate("/genres");
      })
      .catch(() => {
        showFailure(toast, "Genre Failed to Delete");
        return;
      });
  };

  // The delete popup
  const deletePopup = (
    <DeletePopup
      deleteItemIdentifier={"this genre"}
      onConfirm={() => deleteGenreFinal()}
      setIsVisible={setDeletePopupVisible}
    />
  );

  const onSubmit = (): void => {
    const modifiedGenre: Genre = { id: id!, name: genreName, bookCount: 0 };
    logger.debug("Edit Genre Submitted", modifiedGenre);
    GENRES_API.modifyGenre(modifiedGenre)
      .then(() => {
        showSuccess(toast, "Genre modified");
        setOriginalGenreName(genreName);
      })
      .catch(() => showFailure(toast, "Genre could not be modified"));
    setIsModifiable(false);
  };

  // The navigator to switch pages
  const navigate = useNavigate();

  const backButton = (
    <div className="flex col-1">
      <BackButton className="ml-1" />
    </div>
  );

  const deleteButton = (
    <div className="flex col-1">
      <DeleteButton
        onClick={deleteGenrePopup}
        disabled={genreBookCount > 0}
        className={"ml-1 "}
      />
    </div>
  );

  return (
    <div>
      <div className="grid flex justify-content-center">
        <Toast ref={toast} />
        <link
          rel="stylesheet"
          href="https://unpkg.com/primeflex@3.1.2/primeflex.css"
        ></link>
        <div className="flex col-12 p-0">
          {backButton}
          <div className="pt-2 col-10">
            {isModifiable ? (
              <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
                Modify Genre
              </h1>
            ) : (
              <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
                Genre Details
              </h1>
            )}
          </div>
          {deleteButton}
        </div>
        <div className="col-7">
          <form onSubmit={onSubmit}>
            <div className="flex my-4 justify-content-center col-12">
              <div className="my-auto pr-2">
                <label
                  className="text-xl p-component text-teal-900 p-text-secondary"
                  htmlFor="genre"
                >
                  Genre:
                </label>
              </div>
              {!isModifiable ? (
                <p className="flex p-component p-text-secondary text-900 text-xl text-center mx-0 my-auto">
                  {genreName}
                </p>
              ) : (
                <InputText
                  id="genre"
                  className="p-inputtext"
                  name="genre"
                  value={genreName}
                  disabled={!isModifiable}
                  onChange={(event: FormEvent<HTMLInputElement>): void => {
                    setGenreName(event.currentTarget.value);
                  }}
                />
              )}
            </div>

            <div className="grid justify-content-evenly col-12">
              {isModifiable && (
                <Button
                  type="button"
                  label="Cancel"
                  icon="pi pi-times"
                  className="p-button-warning"
                  onClick={() => {
                    setIsModifiable(!isModifiable);
                    setGenreName(originalGenreName);
                  }}
                />
              )}
              <Restricted to={"modify"}>
                {!isModifiable && (
                  <Button
                    type="button"
                    label="Edit"
                    icon="pi pi-pencil"
                    onClick={() => setIsModifiable(!isModifiable)}
                  />
                )}
              </Restricted>
              {isModifiable && (
                <ConfirmButton
                  isPopupVisible={isConfirmationPopVisible}
                  onHide={() => setIsConfirmationPopupVisible(false)}
                  onFinalSubmission={onSubmit}
                  onRejectFinalSubmission={() => {
                    // do nothing
                  }}
                  onShowPopup={() => setIsConfirmationPopupVisible(true)}
                  disabled={!isModifiable}
                  buttonLabel={"Submit"}
                  className="p-button-success p-button-raised"
                />
              )}
            </div>

            {/* Maybe be needed in case the confrim button using the popup breaks */}
            {/* <Button disabled={!this.state.isModifiable} label="submit" type="submit" /> */}
          </form>
        </div>
        {deletePopupVisible && deletePopup}
      </div>
    </div>
  );
}
