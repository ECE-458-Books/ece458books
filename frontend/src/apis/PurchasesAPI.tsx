import { POPurchaseRow } from "../pages/detail/PODetail";
import { PurchaseOrder } from "../pages/list/POList";
import {
  API,
  METHOD_DELETE,
  METHOD_GET,
  METHOD_PATCH,
  METHOD_POST,
} from "./Config";

const PURCHASES_EXTENSION = "purchase_orders";

interface GetPurchaseOrdersReq {
  page: number;
  page_size: number;
  // ordering_field: string | undefined;
  // ordering_ascending: number | null | undefined;
  // search: string;
}

// The structure of the response for a PO from the API
interface APIPurchaseOrder {
  vendor_name: string;
  id: number;
  date: string;
  vendor_id: number;
  purchases: POPurchaseRow[];
  num_books: number;
  num_unique_books: number;
  total_cost: number;
}

export interface APIPOSubmit {
  date: string;
  vendor_id: number;
  purchases: POPurchRowSubmit[];
}

export interface POPurchRowSubmit {
  book_id: number;
  quantity: number;
  unit_wholesale_price: number;
}

export interface GetPurchaseOrdersResp {
  purchaseOrders: PurchaseOrder[];
  numberOfPurchaseOrders: number;
}

export interface GetPurchaseResp {
  purchase: POPurchaseRow[];
}

export const PURCHASES_API = {
  getPurchaseOrders: async function (
    req: GetPurchaseOrdersReq
  ): Promise<GetPurchaseOrdersResp> {
    const response = await API.request({
      url: PURCHASES_EXTENSION,
      method: METHOD_GET,
      params: {
        page: req.page + 1,
        page_size: req.page_size,
      },
    });

    // Convert response to internal data type (not strictly necessary, but I think good practice)
    const purchases = response.data.results.map((pr: APIPurchaseOrder) => {
      return {
        id: pr.id,
        date: pr.date,
        vendorName: pr.vendor_name,
        vendorID: pr.vendor_id,
        puchases: pr.purchases,
        totalBooks: pr.num_books,
        uniqueBooks: pr.num_unique_books,
        totalCost: pr.total_cost,
      };
    });

    return Promise.resolve({
      purchaseOrders: purchases,
      numberOfPurchaseOrders: response.data.count,
    });
  },

  getPurchase: async function (id: number): Promise<GetPurchaseResp> {
    const response = await API.request({
      url: PURCHASES_EXTENSION.concat("/").concat(id.toString()),
      method: METHOD_GET,
    });

    return Promise.resolve({
      purchase: response.data.purchases,
    });
  },

  // Everything below this point has not been tested

  deletePurchaseOrder: async function (id: string) {
    await API.request({
      url: PURCHASES_EXTENSION.concat("/".concat(id)),
      method: METHOD_DELETE,
    });
  },

  modifyPurchaseOrder: async function (po: PurchaseOrder) {
    const poParams = {
      id: po.id,
    };

    await API.request({
      url: PURCHASES_EXTENSION.concat("/".concat(po.id.toString())),
      method: METHOD_PATCH,
      data: poParams,
    });
  },

  addPurchaseOrder: async function (po: APIPOSubmit) {
    await API.request({
      url: PURCHASES_EXTENSION,
      method: METHOD_POST,
      data: {
        date: po.date,
        vendor_id: po.vendor_id,
        purchases: po.purchases,
      },
    });
  },
};
