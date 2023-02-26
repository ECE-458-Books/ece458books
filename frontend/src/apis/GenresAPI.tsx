import {
  API,
  METHOD_DELETE,
  METHOD_GET,
  METHOD_PATCH,
  METHOD_POST,
} from "./Config";

const GENRES_EXTENSION = "genres";

// getGenres
export interface GetGenresReq {
  page: number;
  page_size: number;
  ordering: string;
}

export interface APIGenre {
  id: number;
  name: string;
  book_cnt: number;
}

export interface GetGenresResp {
  results: APIGenre[];
  count: number;
}

// getGenreDetail
export interface GetGenreDetailReq {
  id: string;
}

// deleteGenre
export interface DeleteGenreReq {
  id: string;
}

// modifyGenre
export interface ModifyGenreReq {
  id: string;
  name: string;
}

// addGenre
export interface AddGenreReq {
  name: string;
}

export const GENRES_API = {
  getGenres: async function (req: GetGenresReq): Promise<GetGenresResp> {
    return await API.request({
      url: GENRES_EXTENSION,
      method: METHOD_GET,
      params: req,
    });
  },

  getGenreDetail: async function (req: GetGenreDetailReq): Promise<APIGenre> {
    return await API.request({
      url: GENRES_EXTENSION.concat("/".concat(req.id.toString())),
      method: METHOD_GET,
    });
  },

  deleteGenre: async function (req: DeleteGenreReq) {
    return await API.request({
      url: GENRES_EXTENSION.concat("/".concat(req.id.toString())),
      method: METHOD_DELETE,
    });
  },

  modifyGenre: async function (req: ModifyGenreReq) {
    return await API.request({
      url: GENRES_EXTENSION.concat("/".concat(req.id.toString())),
      method: METHOD_PATCH,
      data: req,
    });
  },

  addGenre: async function (req: AddGenreReq) {
    return await API.request({
      url: GENRES_EXTENSION,
      method: METHOD_POST,
      data: req,
    });
  },
};
