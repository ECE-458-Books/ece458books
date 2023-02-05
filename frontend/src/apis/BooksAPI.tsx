import { Book } from "../pages/list/BookList";
import {
  API,
  METHOD_DELETE,
  METHOD_GET,
  METHOD_PATCH,
  METHOD_POST,
} from "./Config";

const BOOKS_EXTENSION = "books/";

interface GetBooksReq {
  page: number;
  page_size: number;
  ordering_field: string | undefined;
  ordering_ascending: number | null | undefined;
  genre: string;
  search: string;
}

interface APIBook {
  id: number;
  authors: string[];
  genres: string[];
  title: string;
  isbn_13: string;
  isbn_10: string;
  publisher: string;
  publishedDate: number;
  pageCount: number;
  width: number;
  height: number;
  thickness: number;
  retail_price: number;
}

export interface GetBooksResp {
  books: Book[];
  numberOfBooks: number;
}

export const BOOKS_API = {
  getBooks: async function (req: GetBooksReq): Promise<GetBooksResp> {
    const response = await API.request({
      url: BOOKS_EXTENSION,
      method: METHOD_GET,
      params: {
        page: req.page + 1,
        page_size: req.page_size,
        ordering: req.ordering_field,
        genre: req.genre,
        search: req.search,
      },
    });

    // Convert response to internal data type (not strictly necessary, but I think good practice)
    const books = response.data.results.map((book: APIBook) => {
      return {
        id: book.id,
        title: book.title,
        authors: book.authors,
        genres: book.genres,
        isbn13: book.isbn_13,
        isbn10: book.isbn_10,
        publisher: book.publisher,
        publishedYear: book.publishedDate,
        pageCount: book.pageCount,
        width: book.width,
        height: book.height,
        thickness: book.thickness,
        retailPrice: book.retail_price,
      };
    });

    return {
      books: books,
      numberOfBooks: response.data.count,
    };
  },

  // Everything below this point has not been tested

  deleteBook: async function (id: number) {
    await API.request({
      url: BOOKS_EXTENSION.concat(id.toString()),
      method: METHOD_DELETE,
    });
  },

  modifyBook: async function (book: Book) {
    const bookParams = {
      id: book.id,
      title: book.title,
      authors: book.authors,
      genres: book.genres,
      isbn_13: book.isbn13,
      isbn_10: book.isbn10,
      publisher: book.publisher,
      publishedDate: book.publishedYear,
      pageCount: book.pageCount,
      width: book.width,
      height: book.height,
      thickness: book.thickness,
      retail_price: book.retailPrice,
    };

    await API.request({
      url: BOOKS_EXTENSION.concat(book.id.toString()),
      method: METHOD_PATCH,
      data: bookParams,
    });
  },

  addBookInitialLookup: async function (isbns: string) {
    await API.request({
      url: BOOKS_EXTENSION.concat("isbns"),
      method: METHOD_POST,
      data: { isbns: isbns },
    });
  },

  addBookFinal: async function (book: Book) {
    const bookParams = {
      id: book.id,
      title: book.title,
      authors: book.authors,
      genres: book.genres,
      isbn_13: book.isbn13,
      isbn_10: book.isbn10,
      publisher: book.publisher,
      publishedDate: book.publishedYear,
      pageCount: book.pageCount,
      width: book.width,
      height: book.height,
      thickness: book.thickness,
      retail_price: book.retailPrice,
    };

    await API.request({
      url: BOOKS_EXTENSION,
      method: METHOD_POST,
      data: bookParams,
    });
  },
};
