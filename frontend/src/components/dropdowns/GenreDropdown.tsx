import { Dropdown } from "primereact/dropdown";
import { GENRES_API } from "../../apis/GenresAPI";
import { CSSProperties } from "react";

export interface GenreDropdownDataProps {
  setGenreNamesList: (arg0: string[]) => void; // Setter for genre name list
}

export interface GenreDropdownProps {
  setSelectedGenre: (arg0: string) => void;
  genresList: string[];
  selectedGenre: string;
  isDisabled?: boolean;
  style?: CSSProperties;
  showClearButton?: boolean;
}

export function GenresDropdownData(props: GenreDropdownDataProps) {
  GENRES_API.getGenresNoPagination().then((response) => {
    props.setGenreNamesList(response.map((genre) => genre.name));
  });
}

export default function GenresDropdown(props: GenreDropdownProps) {
  return (
    <Dropdown
      value={props.selectedGenre}
      options={props.genresList}
      onChange={(e) => props.setSelectedGenre(e.value)}
      placeholder={"Select Genre"}
      showClear={props.showClearButton ?? true}
      disabled={props.isDisabled}
      style={
        props.style ?? {
          width: "100%",
        }
      }
    />
  );
}
