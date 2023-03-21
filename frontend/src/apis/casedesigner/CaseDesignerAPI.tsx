import { DisplayMode } from "../../components/dropdowns/DisplayModeDropdown";
import {
  API,
  METHOD_DELETE,
  METHOD_GET,
  METHOD_PATCH,
  METHOD_POST,
} from "../Config";

const CASE_DESIGNER_EXTENSION = "case_designer";

// All optional fields are given on the response, but not expected for the creation/editing request
export interface APIBookcase {
  id: number;
  name: string;
  width: number;
  last_edit_date?: string;
  creator_username?: string;
  last_editor_username?: string;
  shelves: APIShelf[];
}

export interface APIShelf {
  displayed_books: APIDisplayBook[];
}

export interface APIDisplayBook {
  book: number;
  display_mode: DisplayMode;
  display_count: number;
  book_isbn?: string;
  book_title?: string;
}

// getBookcaseList
export interface GetBookcasesReq {
  page?: number;
  page_size?: number;
  no_pagination?: boolean;
}

export interface GetBookcasesResp {
  results: APIBookcase[];
  count: number;
}

export const CASE_DESIGNER_API = {
  getBookcases: async function (
    req: GetBookcasesReq
  ): Promise<GetBookcasesResp> {
    return await API.request({
      url: CASE_DESIGNER_EXTENSION,
      method: METHOD_GET,
      params: req,
    });
  },

  getBookcasesNoPagination: async function (
    req: GetBookcasesReq
  ): Promise<APIBookcase[]> {
    return await API.request({
      url: CASE_DESIGNER_EXTENSION,
      method: METHOD_GET,
      params: req,
    });
  },

  getBookcaseDetail: async function (id: number): Promise<APIBookcase> {
    return await API.request({
      url: CASE_DESIGNER_EXTENSION.concat("/".concat(id.toString())),
      method: METHOD_GET,
    });
  },

  deleteBookcase: async function (id: number) {
    return await API.request({
      url: CASE_DESIGNER_EXTENSION.concat("/".concat(id.toString())),
      method: METHOD_DELETE,
    });
  },

  modifyBookcase: async function (req: APIBookcase) {
    return await API.request({
      url: CASE_DESIGNER_EXTENSION.concat("/".concat(req.id.toString())),
      method: METHOD_PATCH,
      data: req,
    });
  },

  addBookcase: async function (req: APIBookcase) {
    return await API.request({
      url: CASE_DESIGNER_EXTENSION,
      method: METHOD_POST,
      data: req,
    });
  },
};