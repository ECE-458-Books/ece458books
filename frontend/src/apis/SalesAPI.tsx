import { SalesReconciliation } from "../pages/list/SRList";
import { SRSaleRow } from "../pages/detail/SRDetail";
import {
  API,
  METHOD_DELETE,
  METHOD_GET,
  METHOD_PATCH,
  METHOD_POST,
} from "./Config";
import { APIPOCreate } from "./PurchasesAPI";

const SALES_EXTENSION = "sales/sales_reconciliation";

// GET

interface GetSalesReconciliationsReq {
  page: number;
  page_size: number;
  ordering: string;
}

// The structure of the response for a SR from the API
interface APISalesReconciliation {
  id: number;
  date: string;
  sales: SRSaleRow[];
  num_books: number;
  num_unique_books: number;
  total_revenue: number;
}

export interface GetSalesReconciliationsResp {
  salesReconciliations: SalesReconciliation[];
  numberOfSalesReconciliations: number;
}

// CREATE/MODIFY

export interface APISRCreate {
  date: string;
  sales: APISRSaleRow[];
}

export interface APISRModify extends APISRCreate {
  id: number;
}

export interface APISRSaleRow {
  id?: number; // ID only for new rows, not already existing ones
  book: number;
  quantity: number;
  unit_retail_price: number;
}

export const SALES_API = {
  getSalesReconciliations: async function (
    req: GetSalesReconciliationsReq
  ): Promise<GetSalesReconciliationsResp> {
    const response = await API.request({
      url: SALES_EXTENSION,
      method: METHOD_GET,
      params: {
        page: req.page + 1,
        page_size: req.page_size,
        ordering: req.ordering,
      },
    });

    // Convert response to internal data type (not strictly necessary, but I think good practice)
    const sales = response.data.results.map((sr: APISalesReconciliation) => {
      return {
        id: sr.id,
        date: sr.date,
        sales: sr.sales,
        num_books: sr.num_books,
        num_unique_books: sr.num_unique_books,
        total_revenue: sr.total_revenue,
      } as SalesReconciliation;
    });

    return Promise.resolve({
      salesReconciliations: sales,
      numberOfSalesReconciliations: response.data.count,
    });
  },

  deleteSalesReconciliation: async function (id: string) {
    await API.request({
      url: SALES_EXTENSION.concat("/").concat(id),
      method: METHOD_DELETE,
    });
  },

  modifySalesReconciliation: async function (sr: APISRModify) {
    await API.request({
      url: SALES_EXTENSION.concat(sr.id.toString()),
      method: METHOD_PATCH,
      data: sr,
    });
  },

  addSalesReconciliation: async function (sr: APISRCreate) {
    await API.request({
      url: SALES_EXTENSION,
      method: METHOD_POST,
      data: sr,
    });
  },
};
