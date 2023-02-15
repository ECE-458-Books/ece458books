import React, { FormEvent, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { ToggleButton } from "primereact/togglebutton";
import ConfirmButton from "../../components/ConfirmPopup";
import { useLocation } from "react-router-dom";
import { GENRES_API } from "../../apis/GenresAPI";
import { Genre } from "../list/GenreList";
import { logger } from "../../util/Logger";
import { Toast } from "primereact/toast";

export interface GenreDetailState {
  id: number;
  genre: string;
  isModifiable: boolean;
  isConfirmationPopupVisible: boolean;
}

export default function GenreDetail() {
  const location = useLocation();
  // Only end up on this page when we are passing genre data
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const detailState = location.state! as GenreDetailState;
  const [genre, setGenre] = useState<string>(detailState.genre);
  const id = detailState.id;
  const [isModifiable, setIsModifiable] = useState<boolean>(
    detailState.isModifiable
  );
  const [isConfirmationPopVisible, setIsConfirmationPopupVisible] =
    useState<boolean>(detailState.isConfirmationPopupVisible);

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  const showSuccess = () => {
    toast.current?.show({ severity: "success", summary: "Genre modified" });
  };

  const showFailure = () => {
    toast.current?.show({
      severity: "error",
      summary: "Genre could not be modified",
    });
  };

  const onSubmit = (): void => {
    const modifiedGenre: Genre = { id: id, name: genre, bookCount: 0 };
    logger.debug("Edit Genre Submitted", modifiedGenre);
    GENRES_API.modifyGenre(modifiedGenre)
      .then(() => showSuccess())
      .catch(() => showFailure());
    setIsModifiable(false);
  };

  return (
    <div>
      <div className="grid flex justify-content-center">
        <link
          rel="stylesheet"
          href="https://unpkg.com/primeflex@3.1.2/primeflex.css"
        ></link>
        <div className="col-5">
          <div className="py-5">
            <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
              Genre Details
            </h1>
          </div>
          <form onSubmit={onSubmit}>
            <Toast ref={toast} />
            <div className="flex pb-8 flex-row justify-content-center card-container col-12">
              <ToggleButton
                id="modifyGenreToggle"
                name="modifyGenreToggle"
                onLabel="Editable"
                offLabel="Edit"
                onIcon="pi pi-check"
                offIcon="pi pi-times"
                checked={isModifiable}
                onChange={() => setIsModifiable(!isModifiable)}
              />
            </div>

            <div className="flex flex-row justify-content-center card-container col-12">
              <div className="pt-2 pr-2">
                <label
                  className="text-xl p-component text-teal-900 p-text-secondary"
                  htmlFor="genre"
                >
                  Genre
                </label>
              </div>
              <InputText
                id="genre"
                className="p-inputtext-sm"
                name="genre"
                value={genre}
                disabled={!isModifiable}
                onChange={(event: FormEvent<HTMLInputElement>): void => {
                  setGenre(event.currentTarget.value);
                }}
              />
            </div>

            <div className="flex flex-row justify-content-center card-container col-12">
              <ConfirmButton
                isVisible={isConfirmationPopVisible}
                hideFunc={() => setIsConfirmationPopupVisible(false)}
                acceptFunc={onSubmit}
                rejectFunc={() => {
                  console.log("reject");
                }}
                buttonClickFunc={() => setIsConfirmationPopupVisible(true)}
                disabled={!isModifiable}
                label={"Submit"}
                className="p-button-success p-button-raised"
              />
            </div>

            {/* Maybe be needed in case the confrim button using the popup breaks */}
            {/* <Button disabled={!this.state.isModifiable} label="submit" type="submit" /> */}
          </form>
        </div>
      </div>
    </div>
  );
}
