import {
  API,
  METHOD_DELETE,
  METHOD_GET,
  METHOD_PATCH,
  METHOD_POST,
} from "./Config";

const BOOKS_EXTENSION = "books";

// getBooks
export interface GetBooksReq {
  page: number;
  page_size: number;
  ordering: string;
  genre: string;
  search: string;
  title_only: boolean;
  publisher_only: boolean;
  author_only: boolean;
  isbn_only: boolean;
}

export interface APIBook {
  id: number;
  authors: string[];
  genres: string[];
  title: string;
  isbn_13: number;
  isbn_10: number;
  publisher: string;
  publishedDate: number;
  pageCount: number;
  width: number;
  height: number;
  thickness: number;
  retail_price: number;
  stock: number;
  urls: string[];
}

export interface GetBooksResp {
  results: APIBook[];
  count: number;
}

// getBookDetail
export interface GetBookDetailReq {
  id: number;
}

// getBookDetail
export interface GetBookDetailReq {
  id: number;
}

// modifyBook
export interface ModifyBookReq {
  book: APIBook;
}

// deleteBook
export interface DeleteBookReq {
  id: number;
}

// addBookInitialLookup
export interface AddBookInitialLookupReq {
  isbns: string;
}

export interface APIBookWithDBTag extends APIBook {
  fromDB: boolean;
}

export interface AddBooksInitialLookupResp {
  books: APIBookWithDBTag[];
  invalid_isbns: string[];
}

// addBookFinal
export interface AddBookFinalReq {
  book: APIBook;
}

export const BOOKS_API = {
  getBooks: async function (req: GetBooksReq): Promise<GetBooksResp> {
    return await API.request({
      url: BOOKS_EXTENSION,
      method: METHOD_GET,
      params: req,
    });
  },

  getBooksNoPagination: async function (): Promise<APIBook[]> {
    return await API.request({
      url: BOOKS_EXTENSION,
      method: METHOD_GET,
      params: {
        no_pagination: true,
      },
    });
  },

  getBookDetail: async function (req: GetBookDetailReq): Promise<APIBook> {
    return await API.request({
      url: BOOKS_EXTENSION.concat("/".concat(req.id.toString())),
      method: METHOD_GET,
    });
  },

  deleteBook: async function (req: DeleteBookReq) {
    return await API.request({
      url: BOOKS_EXTENSION.concat("/".concat(req.id.toString())),
      method: METHOD_DELETE,
    });
  },

  modifyBook: async function (req: ModifyBookReq) {
    return await API.request({
      url: BOOKS_EXTENSION.concat("/".concat(req.book.id.toString())),
      method: METHOD_PATCH,
      data: req.book,
    });
  },

  addBookInitialLookup: async function (
    req: AddBookInitialLookupReq
  ): Promise<AddBooksInitialLookupResp> {
    return await API.request({
      url: BOOKS_EXTENSION.concat("/isbns"),
      method: METHOD_POST,
      data: req,
    });
  },

  addBookFinal: async function (req: AddBookFinalReq) {
    return await API.request({
      url: BOOKS_EXTENSION,
      method: METHOD_POST,
      data: req.book,
    });
  },
};
