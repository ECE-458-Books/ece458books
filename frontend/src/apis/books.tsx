import Book from "../pages/list/BookList";
import { API, METHOD_POST } from "./config";

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

    return response.data.results.map((book: getResp) => {
      return {
        title: book.title,
        authors: book.authors,
        genres: book.genres,
        isbn_13: book.isbn_13,
        isbn_10: book.isbn_10,
        publisher: book.publisher,
        pageCount: book.pageCount,
        publishyear: book.publishedDate,
        width: book.width,
        hgieht: book.height,
        thickness: book.thickness,
        retail_price: book.retail_price,
      };
    });
  },
};
