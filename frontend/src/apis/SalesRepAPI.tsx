import { API, METHOD_GET } from "./Config";

const SALES_REPORT_EXTENTSION = "sales/sales_report/";

// getSalesReport

export interface GetSalesReportReq {
  start: string;
  end: string;
}

export interface GetSalesReportResp {
  total_summary: APISalesReportTotalRow;
  daily_summary: APISalesReportDailyRow[];
  top_books: APISalesReportTopBooksRow[];
}

export interface APISalesReportTotalRow {
  sales_revenue: number;
  buybacks_revenue: number;
  revenue: number;
  cost: number;
  profit: number;
}

export interface APISalesReportTopBooksRow {
  book_id: number;
  num_books_sold: number;
  book_revenue: number;
  total_cost_most_recent: number;
  book_title: string;
  book_profit: number;
}

export interface APISalesReportDailyRow {
  buybacks_revenue: number;
  date: string;
  sales_revenue: number;
  cost: number;
  profit: number;
}

export const SALES_REPORT_API = {
  getSalesReport: async function (
    req: GetSalesReportReq
  ): Promise<GetSalesReportResp> {
    return await API.request({
      url: SALES_REPORT_EXTENTSION.concat(
        "start:" + req.start + "end:" + req.end
      ),
      method: METHOD_GET,
    });
  },
};
