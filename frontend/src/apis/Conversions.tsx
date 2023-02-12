import { BookWithDBTag } from "../pages/add/BookAdd";
import { POPurchaseRow } from "../pages/detail/PODetail";
import { SRSaleRow } from "../pages/detail/SRDetail";
import { Book } from "../pages/list/BookList";
import { Genre } from "../pages/list/GenreList";
import { PurchaseOrder } from "../pages/list/POList";
import { SalesReconciliation } from "../pages/list/SRList";
import { Vendor } from "../pages/list/VendorList";
import {
  ArrayToCommaSeparatedString,
  CommaSeparatedStringToArray,
} from "../util/StringOperations";
import { APIBook, APIBookWithDBTag } from "./BooksAPI";
import { APIGenre } from "./GenresAPI";
import { APIPO } from "./PurchasesAPI";
import { APISR } from "./SalesAPI";
import { APIVendor } from "./VendorsAPI";

// Internal data type -> ordering required for book get API
export const APIBookSortFieldMap = new Map<string, string>([
  ["isbn13", "isbn_13"],
  ["retailPrice", "retail_price"],
  ["title", "title"],
  ["author", "author"],
  ["publisher", "publisher"],
  ["stock", "stock"],
]);

// Internal data type -> ordering required for PO get API
export const APIPOSortFieldMap = new Map<string, string>([
  ["vendorName", "vendor_name"],
  ["vendorId", "vendor"],
  ["uniqueBooks", "num_unique_books"],
  ["totalBooks", "num_books"],
  ["totalCost", "total_cost"],
  ["date", "date"],
]);

// Internal data type -> ordering required for book get API
export const APISRSortFieldMap = new Map<string, string>([
  ["uniqueBooks", "num_unique_books"],
  ["totalBooks", "num_books"],
  ["totalRevenue", "total_revenue"],
  ["date", "date"],
]);

export function APIToInternalBookConversion(book: APIBook): Book {
  return {
    id: book.id,
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
  };
}

export function InternalToAPIBookConversion(book: Book): APIBook {
  return {
    id: book.id,
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
  };
}

export function APIToInternalBookConversionWithDB(
  book: APIBookWithDBTag
): BookWithDBTag {
  return {
    id: book.id,
    author: ArrayToCommaSeparatedString(book.authors),
    genres: ArrayToCommaSeparatedString(book.genres ?? []),
    title: book.title,
    isbn13: book.isbn_13,
    isbn10: book.isbn_10,
    publisher: book.publisher,
    publishedYear: book.publishedDate,
    pageCount: book.pageCount,
    width: book.width,
    height: book.height,
    thickness: book.thickness,
    retailPrice: book.retail_price ?? 0,
    stock: book.stock,
    fromDB: book.fromDB,
  };
}

export function APIToInternalVendorConversion(vendor: APIVendor): Vendor {
  return {
    id: vendor.id,
    name: vendor.name,
    numPO: vendor.num_purchase_orders,
  };
}

export function APIToInternalGenreConversion(genre: APIGenre): Genre {
  return {
    id: genre.id,
    name: genre.name,
    bookCount: genre.book_cnt,
  };
}

export function APIToInternalPOConversion(po: APIPO): PurchaseOrder {
  const purchases: POPurchaseRow[] = po.purchases.map((purchase) => {
    return {
      isNewRow: false,
      // (id is always defined from API)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      id: purchase.id!.toString(),
      subtotal: purchase.subtotal,
      bookId: purchase.book,
      bookTitle: purchase.book_title,
      quantity: purchase.quantity,
      unitWholesalePrice: purchase.unit_wholesale_price,
    };
  });

  return {
    id: po.id,
    date: po.date,
    vendorName: po.vendor_name,
    vendorId: po.vendor_id,
    totalBooks: po.num_books,
    uniqueBooks: po.num_unique_books,
    totalCost: po.total_cost,
    purchases: purchases,
  };
}

export function APItoInternalSRConversion(sr: APISR): SalesReconciliation {
  const sales: SRSaleRow[] = sr.sales.map((sale) => {
    return {
      isNewRow: false,
      // (id is always defined from API)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      id: sale.id!.toString(),
      bookId: sale.book,
      bookTitle: sale.book_title,
      subtotal: sale.subtotal,
      quantity: sale.quantity,
      unitRetailPrice: sale.unit_retail_price,
    };
  });

  return {
    id: sr.id,
    date: sr.date,
    totalBooks: sr.num_books,
    uniqueBooks: sr.num_unique_books,
    totalRevenue: sr.total_revenue,
    sales: sales,
  };
}
