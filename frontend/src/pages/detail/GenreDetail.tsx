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
      <h1>Modify Genre</h1>
      <form onSubmit={onSubmit}>
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

        <label htmlFor="genre">Genre</label>
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
        />

        {/* Maybe be needed in case the confrim button using the popup breaks */}
        {/* <Button disabled={!this.state.isModifiable} label="submit" type="submit" /> */}
      </form>
    </div>
  );
}
