import { Genre } from "../../pages/genres/GenreList";
import { APIGenre } from "./GenresAPI";

// Genre

export const APIGenreSortFieldMap = new Map<string, string>([
  ["name", "name"],
  ["bookCount", "book_cnt"],
]);

export function APIToInternalGenreConversion(genre: APIGenre): Genre {
  return {
    id: genre.id.toString(),
    name: genre.name,
    bookCount: genre.book_cnt,
  };
}
