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

interface GetSalesReconciliationsReq {
  page: number;
  page_size: number;
  // ordering_field: string | undefined;
  // ordering_ascending: number | null | undefined;
  // search: string;
}

// The structure of the response for a SR from the API
interface APISalesReconciliation {
  id: number;
  date: string;
  sales: any;
  num_books: number;
  num_unique_books: number;
  total_revenue: number;
}

export interface GetSalesReconciliationsResp {
  salesReconciliations: SalesReconciliation[];
  numberOfSalesReconciliations: number;
}

export interface GetSaleResp {
  sale: SRSaleRow[];
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
      },
    });

    // Convert response to internal data type (not strictly necessary, but I think good practice)
    const sales = response.data.results.map((sr: APISalesReconciliation) => {
      return {
        id: sr.id,
        date: sr.date,
        sales: sr.sales,
        totalBooks: sr.num_books,
        uniqueBooks: sr.num_unique_books,
        totalRevenue: sr.total_revenue,
      };
    });

    return Promise.resolve({
      salesReconciliations: sales,
      numberOfSalesReconciliations: response.data.count,
    });
  },

  getSale: async function (id: number): Promise<GetSaleResp> {
    const response = await API.request({
      url: SALES_EXTENSION.concat("/").concat(id.toString()),
      method: METHOD_GET,
    });

    return Promise.resolve({
      sale: response.data.sales,
    });
  },

  // getSalesReconciliations: async function (
  //   req: GetSalesReconciliationsReq
  // ): Promise<GetSalesReconciliationsResp> {
  //   const response = await API.request({
  //     url: SALES_EXTENSION,
  //     method: METHOD_GET,
  //     params: {
  //       page: req.page + 1,
  //       page_size: req.page_size,
  //       ordering: req.ordering_field,
  //       search: req.search,
  //     },
  //   });

  //   // Convert response to internal data type (not strictly necessary, but I think good practice)
  //   const sales = response.data.results.map((sr: APISalesReconciliation) => {
  //     return {
  //       id: sr.id,
  //       name: sr.name,
  //     };
  //   });

  //   return Promise.resolve({
  //     salesReconciliations: sales,
  //     numberOfSalesReconciliations: response.data.count,
  //   });
  // },

  // Everything below this point has not been tested

  deleteSalesReconciliation: async function (id: string) {
    await API.request({
      url: SALES_EXTENSION.concat(id),
      method: METHOD_DELETE,
    });
  },

  modifySalesReconciliation: async function (sr: SalesReconciliation) {
    const srParams = {
      id: sr.id,
    };

    await API.request({
      url: SALES_EXTENSION.concat(sr.id.toString()),
      method: METHOD_PATCH,
      data: srParams,
    });
  },

  addSalesReconciliation: async function (sr: string) {
    await API.request({
      url: SALES_EXTENSION,
      method: METHOD_POST,
      data: { name: sr },
    });
  },
};
