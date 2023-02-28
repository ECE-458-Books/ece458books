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
  no_pagination?: boolean;
  page?: number;
  page_size?: number;
  ordering?: string;
  genre?: string;
  search?: string;
  title_only?: boolean;
  publisher_only?: boolean;
  author_only?: boolean;
  isbn_only?: boolean;
  vendor?: number;
}

export interface APIBook {
  id?: number;
  authors: string[];
  genres: string[];
  title: string;
  isbn_13: number;
  isbn_10: number;
  publisher: string;
  publishedDate: number;
  pageCount?: number;
  width?: number;
  height?: number;
  thickness?: number;
  retail_price: number;
  stock: number;
  url: string;
  best_buyback_price: number;
  last_month_sales: number;
  line_items?: APIBookLineItem[];
}

export enum APILineItemType {
  PURCHASE_ORDER = "purchase order",
  SALES_RECONCILIATION = "sales reconciliation",
  BOOK_BUYBACK = "buyback order",
}

export interface APIBookLineItem {
  id: number;
  date: string;
  type: APILineItemType;
  vendor?: number;
  vendor_name?: string;
  unit_price: number;
  quantity: number;
}

export interface GetBooksResp {
  results: APIBook[];
  count: number;
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

  getBooksNoPagination: async function (vendor?: number): Promise<APIBook[]> {
    return await API.request({
      url: BOOKS_EXTENSION,
      method: METHOD_GET,
      params: {
        no_pagination: true,
        vendor: vendor,
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
    formData.append("title", req.book.title);
    formData.append("isbn_13", req.book.isbn_13.toString());
    formData.append("isbn_10", req.book.isbn_10.toString());
    formData.append("publisher", req.book.publisher);
    formData.append("publishedDate", req.book.publishedDate.toString());
    formData.append("authors", req.book.authors.join(", "));
    formData.append("genres", req.book.genres.join(", "));
    formData.append("retail_price", req.book.retail_price.toString());

    // The 0 is converted to null in the DB
    formData.append("width", req.book.width?.toString() ?? "0");
    formData.append("height", req.book.height?.toString() ?? "0");
    formData.append("thickness", req.book.thickness?.toString() ?? "0");
    formData.append("pageCount", req.book.pageCount?.toString() ?? "0");

    if (req.isImageUploaded) {
      formData.append("image", req.image);
    }
    if (req.isImageRemoved) {
      formData.append("setDefaultImage", "true");
    }

    return await API.request({
      url: BOOKS_EXTENSION.concat("/".concat(req.book.id!.toString())),
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
    console.log(req);
    const formData = new FormData();
    formData.append("title", req.book.title);
    formData.append("isbn_13", req.book.isbn_13.toString());
    formData.append("isbn_10", req.book.isbn_10.toString());
    formData.append("publisher", req.book.publisher);
    formData.append("publishedDate", req.book.publishedDate.toString());
    formData.append("authors", req.book.authors.join(", "));
    formData.append("genres", req.book.genres.join(", "));
    formData.append("retail_price", req.book.retail_price.toString());

    // The 0 is converted to null in the DB
    formData.append("width", req.book.width?.toString() ?? "0");
    formData.append("height", req.book.height?.toString() ?? "0");
    formData.append("thickness", req.book.thickness?.toString() ?? "0");
    formData.append("pageCount", req.book.pageCount?.toString() ?? "0");

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
      data: formData,
    });
  },
};
