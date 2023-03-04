import {
  SalesReport,
  SalesReportDailyRow,
  SalesReportTopBooksRow,
  SalesReportTotalRow,
} from "../../pages/sales/SalesReport";
import { GetSalesReportResp } from "./SalesRepAPI";

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
