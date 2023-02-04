import { Book } from "../pages/list/BookList";
import { API, METHOD_GET } from "./Config";

const BOOKS_EXTENSION = "books/";

interface GetBooksReq {
  page: number | undefined;
  page_size: number;
  ordering_field: string | undefined;
  ordering_ascending: number | null | undefined;
  genre: string;
  search: string;
}

// title, author, publisher, ISBN

interface SingleBook {
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
        page: req.page,
        page_size: req.page_size,
        ordering: req.ordering_field,
        genre: req.genre,
        search: req.search,
      },
    });

    // Convert response to internal data type (not strictly necessary, but I think good practice)
    const books = response.data.results.map((book: SingleBook) => {
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
};
