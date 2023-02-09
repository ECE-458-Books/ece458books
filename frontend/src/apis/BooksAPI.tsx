import { BookWithDBTag } from "../pages/add/BookAdd";
import { BooksList } from "../pages/detail/PODetail";
import { Book } from "../pages/list/BookList";
import { CommaSeparatedStringToArray } from "../util/StringOperations";
import {
  API,
  METHOD_DELETE,
  METHOD_GET,
  METHOD_PATCH,
  METHOD_POST,
} from "./Config";

const BOOKS_EXTENSION = "books";

interface GetBooksReq {
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

// The structure of the response for a book from the API
interface APIBook {
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
}

interface APIBookFromAdd extends APIBook {
  fromDB: boolean;
}

interface AddBooksInitialLookupResp {
  books: BookWithDBTag[];
  invalidISBNS: string[];
}

export interface GetBooksResp {
  books: Book[];
  numberOfBooks: number;
}

// The structure of the response for a book from the API
interface APIBookSimplified {
  id: number;
  title: string;
}

export interface GetBooksNoCountResp {
  books: BooksList[];
}

export const BOOKS_API = {
  getBooks: async function (req: GetBooksReq): Promise<GetBooksResp> {
    const response = await API.request({
      url: BOOKS_EXTENSION,
      method: METHOD_GET,
      params: {
        page: req.page + 1,
        page_size: req.page_size,
        ordering: req.ordering,
        genre: req.genre,
        search: req.search,
        title_only: req.title_only,
        publisher_only: req.publisher_only,
        author_only: req.author_only,
        isbn_only: req.isbn_only,
      },
    });

    // Convert response to internal data type (not strictly necessary, but I think good practice)
    const books = response.data.results.map((book: APIBook) => {
      return {
        id: book.id,
        title: book.title,
        author: book.authors.toString(), // changes from array to comma-separated string
        genres: book.genres.toString(),
        isbn_13: book.isbn_13,
        isbn10: book.isbn_10,
        publisher: book.publisher,
        publishedYear: book.publishedDate,
        pageCount: book.pageCount,
        width: book.width,
        height: book.height,
        thickness: book.thickness,
        retailPrice: book.retail_price,
      } as Book;
    });

    return Promise.resolve({
      books: books,
      numberOfBooks: response.data.count,
    });
  },

  getBooksNOPaging: async function (): Promise<GetBooksNoCountResp> {
    const response = await API.request({
      url: BOOKS_EXTENSION,
      method: METHOD_GET,
      params: {
        no_pagination: true,
      },
    });

    // Convert response to internal data type (not strictly necessary, but I think good practice)
    const _books = response.data.map((book: APIBookSimplified) => {
      return {
        id: book.id,
        title: book.title,
      };
    });

    return Promise.resolve({
      books: _books,
    });
  },

  // Everything below this point has not been tested

  deleteBook: async function (id: number) {
    return await API.request({
      url: BOOKS_EXTENSION.concat("/".concat(id.toString())),
      method: METHOD_DELETE,
    });
  },

  modifyBook: async function (book: Book) {
    const bookParams = {
      id: book.id,
      title: book.title,
      authors: CommaSeparatedStringToArray(book.author),
      genres: [book.genres],
      isbn_13: book.isbn_13,
      isbn_10: book.isbn10,
      publisher: book.publisher,
      publishedDate: book.publishedYear,
      pageCount: book.pageCount,
      width: book.width,
      height: book.height,
      thickness: book.thickness,
      retail_price: book.retailPrice,
    } as APIBook;

    return await API.request({
      url: BOOKS_EXTENSION.concat("/".concat(book.id.toString())),
      method: METHOD_PATCH,
      data: bookParams,
    });
  },

  addBookInitialLookup: async function (
    isbns: string
  ): Promise<AddBooksInitialLookupResp> {
    const response = await API.request({
      url: BOOKS_EXTENSION.concat("/isbns"),
      method: METHOD_POST,
      data: { isbns: isbns },
    });

    // Convert response to internal data type (not strictly necessary, but I think good practice)
    const books = response.data.books.map((book: APIBookFromAdd) => {
      return {
        id: book.id,
        title: book.title,
        author: (book.authors ?? "").toString(), // changes from array to comma-separated string
        genres: (book.genres ?? "").toString(), // Doesn't exist on new book, so can't call toString directly
        isbn_13: book.isbn_13,
        isbn10: book.isbn_10,
        publisher: book.publisher,
        publishedYear: book.publishedDate,
        pageCount: book.pageCount,
        width: book.width,
        height: book.height,
        thickness: book.thickness,
        retailPrice: book.retail_price,
        fromDB: book.fromDB,
      } as BookWithDBTag;
    });

    return Promise.resolve({
      books: books,
      invalidISBNS: response.data.invalid_isbns,
    });
  },

  addBookFinal: async function (book: Book) {
    const bookParams = {
      id: book.id,
      title: book.title,
      authors: CommaSeparatedStringToArray(book.author),
      genres: CommaSeparatedStringToArray(book.genres),
      isbn_13: book.isbn_13,
      isbn_10: book.isbn10,
      publisher: book.publisher,
      publishedDate: book.publishedYear,
      pageCount: book.pageCount,
      width: book.width,
      height: book.height,
      thickness: book.thickness,
      retail_price: book.retailPrice,
    };

    return await API.request({
      url: BOOKS_EXTENSION,
      method: METHOD_POST,
      data: bookParams,
    });
  },
};
