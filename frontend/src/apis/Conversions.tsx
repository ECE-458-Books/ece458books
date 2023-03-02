import { v4 as uuid } from "uuid";
import { BookWithDBTag } from "../pages/add/BookAdd";
import { POPurchaseRow } from "../pages/detail/PODetail";
import { SRSaleRow } from "../pages/detail/SRDetail";
import { Book } from "../pages/list/BookList";
import { Genre } from "../pages/list/GenreList";
import { PurchaseOrder } from "../pages/list/POList";
import {
  SalesReport,
  SalesReportDailyRow,
  SalesReportTopBooksRow,
  SalesReportTotalRow,
} from "../pages/list/SalesReport";
import { SalesReconciliation } from "../pages/list/SRList";
import { Vendor } from "../pages/list/VendorList";
import { externalToInternalDate } from "../util/DateOperations";
import {
  ArrayToCommaSeparatedString,
  CommaSeparatedStringToArray,
} from "../util/StringOperations";
import {
  APIBook,
  APIBookLineItem,
  APIBookWithDBTag,
  APILineItemType,
} from "./BooksAPI";
import { APIGenre } from "./GenresAPI";
import {
  APIPO,
  APIPOPurchaseRow,
  APIPurchaseCSVImportRow,
} from "./PurchasesAPI";
import { APISaleCSVImportRow, APISR, APISRSaleRow } from "./SalesAPI";
import { GetSalesReportResp } from "./SalesRepAPI";
import { APIVendor } from "./VendorsAPI";
import { BuyBack } from "../pages/list/BuyBackList";
import { APIBB, APIBBCSVImportRow, APIBBSaleRow } from "./BuyBackAPI";
import { BBSaleRow } from "../pages/detail/BBDetail";
import {
  BookDetailLineItem,
  BookDetailLineItemType,
} from "../pages/detail/BookDetailLineItems";
import { DEFAULT_BOOK_IMAGE } from "../components/uploaders/ImageFileUploader";
import axios from "axios";
import { formatBookForDropdown } from "../components/dropdowns/BookDropdown";

// Internal data type -> ordering required for book get API
export const APIBookSortFieldMap = new Map<string, string>([
  ["isbn13", "isbn_13"],
  ["isbn10", "isbn_10"],
  ["genres", "genre"],
  ["retailPrice", "retail_price"],
  ["title", "title"],
  ["author", "author"],
  ["publisher", "publisher"],
  ["stock", "stock"],
  ["bestBuybackPrice", "best_buyback_price"],
  ["lastMonthSales", "last_month_sales"],
  ["shelfSpace", "shelf_space"],
  ["daysOfSupply", "days_of_supply"],
]);

export const APIGenreSortFieldMap = new Map<string, string>([
  ["name", "name"],
  ["bookCount", "book_cnt"],
]);

export const APIVendorSortFieldMap = new Map<string, string>([
  ["name", "name"],
  ["buybackRate", "null_considered_buyback_rate"],
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

// Internal data type -> ordering required for book get API
export const APIBBSortFieldMap = new Map<string, string>([
  ["vendorName", "vendor_name"],
  ["vendorId", "vendor"],
  ["uniqueBooks", "num_unique_books"],
  ["totalBooks", "num_books"],
  ["totalRevenue", "total_revenue"],
  ["date", "date"],
]);

// External line item -> Internal Line Item
export const LineItemMapper = new Map<APILineItemType, BookDetailLineItemType>([
  [APILineItemType.PURCHASE_ORDER, BookDetailLineItemType.PURCHASE_ORDER],
  [
    APILineItemType.SALES_RECONCILIATION,
    BookDetailLineItemType.SALES_RECONCILIATION,
  ],
  [APILineItemType.BOOK_BUYBACK, BookDetailLineItemType.BOOK_BUYBACK],
]);

// Books

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
    daysOfSupply: book.days_of_supply,
    shelfSpace: book.shelf_space,
    lineItems: book.line_items?.map((lineItem) => {
      return APIToInternalLineItemConversion(lineItem);
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
    id: book.id?.toString() ?? uuid(), // ID does not exist for new books
    author: ArrayToCommaSeparatedString(book.authors ?? ["Unknown"]),
    genres: ArrayToCommaSeparatedString(book.genres ?? []),
    title: book.title,
    isbn13: book.isbn_13,
    isbn10: book.isbn_10,
    publisher: book.publisher ?? "Unknown",
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
    daysOfSupply: book.days_of_supply,
    shelfSpace: book.shelf_space,
    isGhost: book.isGhost,
  };
}

// Vendor

export function APIToInternalVendorConversion(vendor: APIVendor): Vendor {
  return {
    id: vendor.id.toString(),
    name: vendor.name,
    numPO: vendor.num_purchase_orders,
    buybackRate: vendor.buyback_rate,
  };
}

// Genre

export function APIToInternalGenreConversion(genre: APIGenre): Genre {
  return {
    id: genre.id.toString(),
    name: genre.name,
    bookCount: genre.book_cnt,
  };
}

// Purchase Orders

export function APIToInternalPOPurchaseConversion(
  purchase: APIPOPurchaseRow
): POPurchaseRow {
  return {
    isNewRow: false,
    // (id is always defined from API)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    id: purchase.id!.toString(),
    bookId: purchase.book,
    bookTitle: formatBookForDropdown(purchase.book_title, purchase.book_isbn),
    bookISBN: purchase.book_isbn,
    quantity: purchase.quantity,
    price: purchase.unit_wholesale_price,
  };
}

export function APIToInternalPOConversion(po: APIPO): PurchaseOrder {
  const purchases: POPurchaseRow[] = po.purchases.map((purchase) =>
    APIToInternalPOPurchaseConversion(purchase)
  );

  return {
    id: po.id.toString(),
    date: externalToInternalDate(po.date),
    vendorName: po.vendor_name,
    vendorId: po.vendor_id,
    totalBooks: po.num_books,
    uniqueBooks: po.num_unique_books,
    totalCost: po.total_cost,
    purchases: purchases,
    isDeletable: po.is_deletable,
  };
}

export function APIToInternalPurchasesCSVConversion(
  purchases: APIPurchaseCSVImportRow[]
): POPurchaseRow[] {
  return purchases.map((purchase) => {
    return {
      isNewRow: true,
      id: uuid(),
      subtotal: 0, // Temporary, subtotal will be deprecated
      bookId: purchase.book,
      bookTitle: formatBookForDropdown(purchase.book_title, purchase.isbn_13),
      bookISBN: purchase.isbn_13,
      quantity: purchase.quantity,
      price: purchase.unit_wholesale_price,
      errors: purchase.errors,
    } as POPurchaseRow;
  });
}

// Sales Reconciliations

function APIToInternalSRSaleConversion(sale: APISRSaleRow): SRSaleRow {
  return {
    isNewRow: false,
    // (id is always defined from API)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    id: sale.id!.toString(),
    bookId: sale.book,
    bookISBN: sale.book_isbn,
    bookTitle: formatBookForDropdown(sale.book_title, sale.book_isbn),
    quantity: sale.quantity,
    price: sale.unit_retail_price,
  };
}

export function APIToInternalSRConversion(sr: APISR): SalesReconciliation {
  const sales: SRSaleRow[] = sr.sales.map((sale) =>
    APIToInternalSRSaleConversion(sale)
  );

  return {
    id: sr.id.toString(),
    date: externalToInternalDate(sr.date),
    totalBooks: sr.num_books,
    uniqueBooks: sr.num_unique_books,
    totalRevenue: sr.total_revenue,
    sales: sales,
    isDeletable: sr.is_deletable,
  };
}

export function APIToInternalSalesCSVConversion(
  sales: APISaleCSVImportRow[]
): SRSaleRow[] {
  return sales.map((sale) => {
    return {
      isNewRow: true,
      id: uuid(),
      subtotal: 0, // Temporary, subtotal will be deprecated
      bookId: sale.book,
      bookTitle: formatBookForDropdown(sale.book_title, sale.isbn_13),
      bookISBN: sale.isbn_13,
      quantity: sale.quantity,
      price: sale.unit_retail_price,
      errors: sale.errors,
    } as SRSaleRow;
  });
}

// Buy Backs

function APIToInternalBBSaleConversion(sale: APIBBSaleRow): BBSaleRow {
  return {
    isNewRow: false,
    // (id is always defined from API)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    id: sale.id!.toString(),
    bookId: sale.book,
    bookISBN: sale.book_isbn,
    bookTitle: formatBookForDropdown(sale.book_title, sale.book_isbn),
    quantity: sale.quantity,
    price: sale.unit_buyback_price,
  };
}

export function APIToInternalBBConversion(bb: APIBB): BuyBack {
  const sales: BBSaleRow[] = bb.buybacks.map((sale) =>
    APIToInternalBBSaleConversion(sale)
  );

  return {
    id: bb.id.toString(),
    date: externalToInternalDate(bb.date),
    totalBooks: bb.num_books,
    uniqueBooks: bb.num_unique_books,
    totalRevenue: bb.total_revenue,
    vendorID: bb.vendor,
    vendorName: bb.vendor_name,
    sales: sales,
    isDeletable: bb.is_deletable,
  };
}

export function APIToInternalBuybackCSVConversion(
  buybacks: APIBBCSVImportRow[]
): BBSaleRow[] {
  return buybacks.map((buyback) => {
    return {
      isNewRow: true,
      id: uuid(),
      subtotal: 0, // Temporary, subtotal will be deprecated
      bookId: buyback.book,
      bookTitle: formatBookForDropdown(buyback.book_title, buyback.isbn_13),
      bookISBN: buyback.isbn_13,
      quantity: buyback.quantity,
      price: buyback.unit_buyback_price,
      errors: buyback.errors,
    } as POPurchaseRow;
  });
}

// Sales Report

export function APIToInternalSalesReportConversion(
  salesRep: GetSalesReportResp
): SalesReport {
  const dailyRows: SalesReportDailyRow[] = salesRep.daily_summary.map(
    (daily) => {
      return {
        date: daily.date,
        buybacksRevenue: daily.buybacks_revenue,
        salesRevenue: daily.sales_revenue,
        cost: daily.cost,
        profit: daily.profit,
      };
    }
  );

  const topBooksRows: SalesReportTopBooksRow[] = salesRep.top_books.map(
    (book) => {
      return {
        bookId: book.book_id,
        bookTitle: book.book_title,
        bookRevenue: book.book_revenue,
        bookProfit: book.book_profit,
        numBooksSold: book.num_books_sold,
        totalCostMostRecent: book.total_cost_most_recent,
      };
    }
  );

  const totalRow: SalesReportTotalRow = {
    buybacksRevenue: salesRep.total_summary.buybacks_revenue,
    salesRevenue: salesRep.total_summary.sales_revenue,
    revenue: salesRep.total_summary.revenue,
    cost: salesRep.total_summary.cost,
    profit: salesRep.total_summary.profit,
  };

  return {
    dailySummaryRows: dailyRows,
    topBooksRows: topBooksRows,
    totalRow: totalRow,
  };
}
