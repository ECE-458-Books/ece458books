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
  url: string;
}

export interface GetBooksResp {
  results: APIBook[];
  count: number;
}

// getBooksNoPagination
export interface GetBooksNoPageReq {
  no_pagination: boolean;
  ordering: string;
  genre: string;
  search: string;
  title_only: boolean;
  publisher_only: boolean;
  author_only: boolean;
  isbn_only: boolean;
}

// getBooksNamesListNoPagination
export interface APIBookSimplified {
  id: number;
  title: string;
}

// getBookDetail
export interface GetBookDetailReq {
  id: string;
}

// modifyBook
export interface ModifyBookReq {
  book: APIBook;
  image: File;
  isImageUploaded: boolean;
  isImageRemoved: boolean;
}

// deleteBook
export interface DeleteBookReq {
  id: string;
}

// addBookInitialLookup
export interface AddBookInitialLookupReq {
  isbns: string;
}

export interface APIBookWithDBTag extends APIBook {
  fromDB: boolean;
  image_url: string;
}

export interface AddBooksInitialLookupResp {
  books: APIBookWithDBTag[];
  invalid_isbns: string[];
}

// addBookFinal
export interface AddBookFinalReq {
  book: APIBook;
  image: File;
  isImageUploaded: boolean;
  isImageRemoved: boolean;
}

export const BOOKS_API = {
  getBooks: async function (req: GetBooksReq): Promise<GetBooksResp> {
    return await API.request({
      url: BOOKS_EXTENSION,
      method: METHOD_GET,
      params: req,
    });
  },

  getBooksNoPaginationFiltered: async function (
    req: GetBooksNoPageReq
  ): Promise<APIBook[]> {
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
    const formData = new FormData();
    formData.append("genres", req.book.genres.join(", "));
    formData.append("pageCount", req.book.pageCount.toString());
    formData.append("thickness", req.book.thickness.toString());
    formData.append("width", req.book.width.toString());
    formData.append("height", req.book.height.toString());
    formData.append("retail_price", req.book.retail_price.toString());
    if (req.isImageUploaded) {
      formData.append("image", req.image);
    }
    if (req.isImageRemoved) {
      formData.append("setDefaultImage", "true");
    }

    return await API.request({
      url: BOOKS_EXTENSION.concat("/".concat(req.book.id.toString())),
      headers: {
        "Content-Type": "multipart/form-data",
      },
      method: METHOD_PATCH,
      data: formData,
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
    const formData = new FormData();
    formData.append("genres", req.book.genres.join(", "));
    formData.append("pageCount", req.book.pageCount.toString());
    formData.append("thickness", req.book.thickness.toString());
    formData.append("width", req.book.width.toString());
    formData.append("height", req.book.height.toString());
    formData.append("retail_price", req.book.retail_price.toString());
    if (req.isImageUploaded) {
      formData.append("image", req.image);
    }
    if (req.isImageRemoved) {
      formData.append("setDefaultImage", "true");
    }

    return await API.request({
      url: BOOKS_EXTENSION,
      method: METHOD_POST,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: req.book,
    });
  },
};
