import { v4 as uuid } from "uuid";
import { BookWithDBTag } from "../../pages/books/BookAdd";
import { Book } from "../../pages/books/BookList";
import { externalToInternalDate } from "../../util/DateOps";
import {
  ArrayToCommaSeparatedString,
  CommaSeparatedStringToArray,
} from "../../util/StringOps";
import {
  APIBook,
  APIBookLineItem,
  APIBookWithDBTag,
  APILineItemType,
  APIRelatedBook,
} from "./BooksAPI";
import {
  BookDetailLineItem,
  BookDetailLineItemType,
} from "../../pages/books/BookDetailLineItems";
import { DEFAULT_BOOK_IMAGE } from "../../components/uploaders/ImageFileUploader";
import { RelatedBook } from "../../pages/books/BookDetailRelatedBooks";

export const APIBookSortFieldMap = new Map<string, string>([
  ["isbn13", "isbn_13"],
  ["isbn10", "isbn_10"],
  ["genres", "genre"],
  ["retailPrice", "retail_price"],
  ["title", "title"],
  ["author", "author"],
  ["publisher", "publisher"],
  ["publishedYear", "publishedDate"],
  ["stock", "stock"],
  ["bestBuybackPrice", "best_buyback_price"],
  ["lastMonthSales", "last_month_sales"],
  ["shelfSpace", "shelf_space"],
  ["daysOfSupply", "days_of_supply"],
  ["numRelatedBooks", "num_related_books"],
]);

// External line item -> Internal Line Item
export const LineItemMapper = new Map<APILineItemType, BookDetailLineItemType>([
  [APILineItemType.PURCHASE_ORDER, BookDetailLineItemType.PURCHASE_ORDER],
  [APILineItemType.SALES_RECORD, BookDetailLineItemType.SALES_RECORD],
  [
    APILineItemType.SALES_RECONCILIATION,
    BookDetailLineItemType.SALES_RECONCILIATION,
  ],
  [APILineItemType.BOOK_BUYBACK, BookDetailLineItemType.BOOK_BUYBACK],
  [
    APILineItemType.INVENTORY_CORRECTION,
    BookDetailLineItemType.INVENTORY_CORRECTION,
  ],
]);

function APIToInternalLineItemConversion(
  lineItem: APIBookLineItem
): BookDetailLineItem {
  return {
    id: lineItem.id.toString(),
    date: externalToInternalDate(lineItem.date),
    type: LineItemMapper.get(lineItem.type)!,
    vendor: lineItem.vendor,
    vendorName: lineItem.vendor_name,
    price: lineItem.unit_price,
    quantity: lineItem.quantity,
    creatorName: lineItem.username,
    stock: lineItem.stock,
  };
}

function APIToInternalRelatedBookConversion(
  relatedBook: APIRelatedBook
): RelatedBook {
  return {
    id: relatedBook.id.toString(),
    author: ArrayToCommaSeparatedString(relatedBook.authors),
    genres: ArrayToCommaSeparatedString(relatedBook.genres),
    title: relatedBook.title,
    isbn13: relatedBook.isbn_13,
    publisher: relatedBook.publisher,
    publishedYear: relatedBook.publishedDate,
    retailPrice: relatedBook.retail_price,
    imageUrl: relatedBook.image_url,
  };
}

export function APIToInternalBookConversion(book: APIBook): Book {
  return {
    id: book.id!.toString(),
    author: ArrayToCommaSeparatedString(book.authors),
    genres: ArrayToCommaSeparatedString(book.genres),
    title: book.title,
    isbn13: book.isbn_13,
    isbn10: book.isbn_10,
    publisher: book.publisher,
    publishedYear: book.publishedDate,
    pageCount: book.pageCount,
    width: book.width,
    height: book.height,
    thickness: book.thickness,
    retailPrice: book.retail_price,
    stock: book.stock,
    thumbnailURL: book.image_url,
    bestBuybackPrice: book.best_buyback_price,
    lastMonthSales: book.last_month_sales,
    daysOfSupply: book.days_of_supply === "inf" ? "(inf)" : book.days_of_supply,
    shelfSpace: book.shelf_space,
    lineItems: book.line_items?.map((lineItem) => {
      return APIToInternalLineItemConversion(lineItem);
    }),
    numRelatedBooks: book.num_related_books,
    relatedBooks: book.related_books?.map((relatedBook) => {
      return APIToInternalRelatedBookConversion(relatedBook);
    }),
  };
}

export function InternalToAPIBookConversion(book: Book): APIBook {
  return {
    id: Number(book.id),
    authors: CommaSeparatedStringToArray(book.author),
    genres: CommaSeparatedStringToArray(book.genres),
    title: book.title,
    isbn_13: book.isbn13,
    isbn_10: book.isbn10,
    publisher: book.publisher,
    publishedDate: book.publishedYear,
    pageCount: book.pageCount,
    width: book.width,
    height: book.height,
    thickness: book.thickness,
    retail_price: book.retailPrice,
    stock: book.stock,
    image_url: book.thumbnailURL,
    best_buyback_price: book.lastMonthSales,
    last_month_sales: book.bestBuybackPrice,
    shelf_space: book.shelfSpace,
    days_of_supply: book.daysOfSupply,
  };
}

export function APIToInternalBookConversionWithDB(
  book: APIBookWithDBTag
): BookWithDBTag {
  return {
    id: book.id?.toString() ?? uuid(),
    author: ArrayToCommaSeparatedString(book.authors ?? ["Unknown"]),
    genres: ArrayToCommaSeparatedString(book.genres ?? []),
    title: book.title,
    isbn13: book.isbn_13,
    isbn10: book.isbn_10 == "" ? "Unknown" : book.isbn_10,
    publisher: book.publisher == "" ? "Unknown" : book.publisher,
    publishedYear: book.publishedDate,
    pageCount: book.pageCount,
    width: book.width,
    height: book.height,
    thickness: book.thickness,
    retailPrice: book.retail_price ?? 0,
    stock: book.stock,
    thumbnailURL: book.image_url ?? DEFAULT_BOOK_IMAGE,
    fromDB: book.fromDB,
    bestBuybackPrice: book.best_buyback_price,
    lastMonthSales: book.last_month_sales,
    daysOfSupply: book.days_of_supply === "inf" ? "(inf)" : book.days_of_supply,
    shelfSpace: book.shelf_space,
    isGhost: book.isGhost,
    numRelatedBooks: book.num_related_books,
    relatedBooks: book.related_books?.map((relatedBook) => {
      return APIToInternalRelatedBookConversion(relatedBook);
    }),
  };
}
