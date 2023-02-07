import React, { FormEvent, useState } from "react";
import { InputText } from "primereact/inputtext";
import { ToggleButton } from "primereact/togglebutton";
import ConfirmButton from "../../components/ConfirmButton";
import { useLocation } from "react-router-dom";
import { GENRES_API } from "../../apis/GenresAPI";
import { Genre } from "../list/GenreList";
import { logger } from "../../util/Logger";

export interface GenreDetailState {
  id: number;
  genre: string;
  isModifiable: boolean;
  isConfirmationPopupVisible: boolean;
}

export default function GenreDetail() {
  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const detailState = location.state! as GenreDetailState;
  const [genre, setGenre] = useState<string>(detailState.genre);
  const [id, setId] = useState(detailState.id);
  const [isModifiable, setIsModifiable] = useState(detailState.isModifiable);
  const [isConfirmationPopVisible, setIsConfirmationPopupVisible] = useState(
    detailState.isConfirmationPopupVisible
  );

  const onSubmit = (): void => {
    const modifiedGenre: Genre = { id: id, genre: genre, numGenres: 0 };
    logger.debug("Edit Genre Submitted", modifiedGenre);
    GENRES_API.modifyGenre(modifiedGenre);
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
            <h1 className="text-center text-900 color: var(--surface-800);">
              Modify Genre
            </h1>
          </div>
          <form onSubmit={onSubmit}>
            <div className="flex pb-8 flex-row justify-content-center card-container col-12">
              <ToggleButton
                id="modifyGenreToggle"
                name="modifyGenreToggle"
                onLabel="Modifiable"
                offLabel="Modify"
                onIcon="pi pi-check"
                offIcon="pi pi-times"
                checked={isModifiable}
                onChange={() => setIsModifiable(!isModifiable)}
              />
            </div>

            <div className="flex flex-row justify-content-center card-container col-12">
              <div className="pt-2 pr-2">
                <label className="text-xl" htmlFor="genre">
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
                label={"Update"}
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
