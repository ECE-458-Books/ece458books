import { Genre } from "../pages/list/GenreList";
import {
  API,
  METHOD_DELETE,
  METHOD_GET,
  METHOD_PATCH,
  METHOD_POST,
} from "./Config";

const GENRES_EXTENSION = "genres/";

interface GetGenresReq {
  page: number;
  page_size: number;
  ordering_field: string | undefined;
  ordering_ascending: number | null | undefined;
  search: string;
}

// The structure of the response for a genre from the API
interface APIGenre {
  id: number;
  name: string;
  book_cnt: number;
}

export interface GetGenresResp {
  genres: Genre[];
  numberOfGenres: number;
}

export const GENRES_API = {
  getGenres: async function (req: GetGenresReq): Promise<GetGenresResp> {
    const response = await API.request({
      url: GENRES_EXTENSION,
      method: METHOD_GET,
      params: {
        page: req.page + 1,
        page_size: req.page_size,
        ordering: req.ordering_field,
        search: req.search,
      },
    });

    // Convert response to internal data type (not strictly necessary, but I think good practice)
    const genres = response.data.results.map((genre: APIGenre) => {
      return {
        id: genre.id,
        genre: genre.name,
        numBooks: genre.book_cnt,
      };
    });

    return Promise.resolve({
      genres: genres,
      numberOfGenres: response.data.count,
    });
  },

  // Everything below this point has not been tested

  deleteGenre: async function (id: number) {
    await API.request({
      url: GENRES_EXTENSION.concat(id.toString()),
      method: METHOD_DELETE,
    });
  },

  modifyGenre: async function (genre: Genre) {
    const genreParams = {
      id: genre.id,
      name: genre.genre,
    };

    await API.request({
      url: GENRES_EXTENSION.concat(genre.id.toString()),
      method: METHOD_PATCH,
      data: genreParams,
    });
  },

  addGenres: async function (genres: string) {
    await API.request({
      url: GENRES_EXTENSION,
      method: METHOD_POST,
      data: { name: genres },
    });
  },
};
