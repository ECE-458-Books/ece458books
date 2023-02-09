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

// GET

interface GetPurchaseOrdersReq {
  page: number;
  page_size: number;
  ordering: string;
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

export interface GetPurchaseOrdersResp {
  purchaseOrders: PurchaseOrder[];
  numberOfPurchaseOrders: number;
}

// CREATE/MODIFY

export interface APIPOCreate {
  date: string;
  vendor: number;
  purchases: APIPOPurchaseRow[];
}

export interface APIPOModify extends APIPOCreate {
  id: number;
}

export interface APIPOPurchaseRow {
  id?: number; // ID only for new rows, not already existing ones
  subtotal: number;
  book: number;
  quantity: number;
  unit_wholesale_price: number;
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
        ordering: req.ordering,
      },
    });

    // Convert response to internal data type (not strictly necessary, but I think good practice)
    const purchases = response.data.results.map((pr: APIPurchaseOrder) => {
      return {
        id: pr.id,
        date: pr.date,
        vendor_name: pr.vendor_name,
        vendor: pr.vendor_id,
        purchases: pr.purchases,
        num_books: pr.num_books,
        num_unique_books: pr.num_unique_books,
        total_cost: pr.total_cost,
      } as PurchaseOrder;
    });

    return Promise.resolve({
      purchaseOrders: purchases,
      numberOfPurchaseOrders: response.data.count,
    });
  },

  // Everything below this point has not been tested

  deletePurchaseOrder: async function (id: string) {
    return await API.request({
      url: PURCHASES_EXTENSION.concat("/".concat(id)),
      method: METHOD_DELETE,
    });
  },

  modifyPurchaseOrder: async function (po: APIPOModify) {
    return await API.request({
      url: PURCHASES_EXTENSION.concat("/".concat(po.id.toString())),
      method: METHOD_PATCH,
      data: po,
    });
  },

  addPurchaseOrder: async function (po: APIPOCreate) {
    return await API.request({
      url: PURCHASES_EXTENSION,
      method: METHOD_POST,
      data: po,
    });
  },
};
