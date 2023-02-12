import { SalesReconciliation } from "../pages/list/SRList";
import { SRSaleRow } from "../pages/detail/SRDetail";
import {
  API,
  METHOD_DELETE,
  METHOD_GET,
  METHOD_PATCH,
  METHOD_POST,
} from "./Config";

const SALES_EXTENSION = "sales/sales_reconciliation";

// getSalesReconciliations
export interface GetSRsReq {
  page: number;
  page_size: number;
  ordering: string;
}

export interface APISRSaleRow {
  id?: number; // ID only for new rows, not already existing ones
  book: number;
  book_title: string;
  subtotal: number;
  quantity: number;
  unit_retail_price: number;
}

export interface APISR {
  id: number;
  date: string;
  sales: APISRSaleRow[];
  num_books: number;
  num_unique_books: number;
  total_revenue: number;
}

export interface GetSRsResp {
  results: APISR[];
  count: number;
}

// deleteSalesReconciliation
export interface DeleteSRReq {
  id: number;
}

// addSalesReconciliation
export interface AddSRReq {
  date: string;
  sales: APISRSaleRow[];
}

// modifySalesReconciliation
export interface ModifySRReq extends AddSRReq {
  id: number;
}

export const SALES_API = {
  getSalesReconciliations: async function (
    req: GetSRsReq
  ): Promise<GetSRsResp> {
    return await API.request({
      url: SALES_EXTENSION,
      method: METHOD_GET,
      params: req,
    });
  },

  deleteSalesReconciliation: async function (req: DeleteSRReq) {
    return await API.request({
      url: SALES_EXTENSION.concat("/").concat(req.id.toString()),
      method: METHOD_DELETE,
    });
  },

  modifySalesReconciliation: async function (req: ModifySRReq) {
    return await API.request({
      url: SALES_EXTENSION.concat("/").concat(req.id.toString()),
      method: METHOD_PATCH,
      data: req,
    });
  },

  addSalesReconciliation: async function (req: AddSRReq) {
    return await API.request({
      url: SALES_EXTENSION,
      method: METHOD_POST,
      data: req,
    });
  },
};
