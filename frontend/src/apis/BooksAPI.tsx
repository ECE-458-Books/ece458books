import Book from "../pages/list/BookList";
import { API, METHOD_POST } from "./Config";

const BOOKS_EXTENSION = "books/";

interface getResp {
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

export const BooksAPI = {
  get: async function (page: number, page_size: number): Promise<Book[]> {
    const response = await API.request({
      url: BOOKS_EXTENSION,
      method: METHOD_POST,
      params: JSON.stringify({
        page: page,
        page_size: page_size,
      }),
    });

    // Convert response to internal data type (not strictly necessary, but I think good practice)
    return response.data.results.map((book: getResp) => {
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
        retail_price: book.retail_price,
      };
    });
  },
};
