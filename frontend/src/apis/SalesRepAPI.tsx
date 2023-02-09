import {
  salesReportDailyRow,
  salesReportTopBooksRow,
} from "../pages/list/SalesReport";
import {
  API,
  METHOD_DELETE,
  METHOD_GET,
  METHOD_PATCH,
  METHOD_POST,
} from "./Config";

const SALES_REPORT_EXTENTSION = "sales/sales_report/";

interface GetSalesReportReq {
  start: string;
  end: string;
}

export interface GetSalesReportResp {
  revenue: number;
  cost: number;
  profit: number;
  daily_summary: salesReportDailyRow[];
  top_books: salesReportTopBooksRow[];
}

export const SALES_REPORT_API = {
  getSalesReport: async function (
    req: GetSalesReportReq
  ): Promise<GetSalesReportResp> {
    const response = await API.request({
      url: SALES_REPORT_EXTENTSION.concat(
        "start:" + req.start + "end:" + req.end
      ),
      method: METHOD_GET,
    });

    // Convert response to internal data type (not strictly necessary, but I think good practice)
    const daily = response.data.daily_summary.map((sr: salesReportDailyRow) => {
      return {
        date: sr.date,
        revenue: sr.revenue,
        cost: sr.cost,
        profit: sr.profit,
      };
    });

    // Convert response to internal data type (not strictly necessary, but I think good practice)
    const top = response.data.top_books.map((sr: salesReportTopBooksRow) => {
      return {
        book_id: sr.book_id,
        num_books_sold: sr.num_books_sold,
        book_revenue: sr.book_revenue,
        total_cost_most_recent: sr.total_cost_most_recent,
        book_title: sr.book_title,
        book_profit: sr.book_profit,
      };
    });

    return Promise.resolve({
      revenue: response.data.total_summary.revenue,
      cost: response.data.total_summary.cost,
      profit: response.data.total_summary.profit,
      daily_summary: daily,
      top_books: top,
    });
  },
};
