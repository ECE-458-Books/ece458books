import { Dropdown } from "primereact/dropdown";
import { useEffect, useState } from "react";
import { GENRES_API } from "../../apis/GenresAPI";

export interface GenreDropdownProps {
  setSelectedGenre: (arg0: string) => void;
  selectedGenre: string;
}

// This cannot be used in a table cell in the current form, only when there is one on the page
export default function GenreDropdown(props: GenreDropdownProps) {
  const [genreList, setGenreList] = useState<string[]>([]);

  useEffect(() => {
    GENRES_API.getGenres({
      page: 1,
      page_size: 30,
      ordering: "name",
    }).then((response) =>
      setGenreList(response.results.map((genre) => genre.name))
    );
  }, []);

  return (
    <Dropdown
      value={props.selectedGenre}
      options={genreList}
      appendTo={"self"}
      onChange={(e) => props.setSelectedGenre(e.value)}
      placeholder={"Select Genre"}
      showClear
    />
  );
}
