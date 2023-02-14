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

// getPurchaseOrders

export interface GetPOsReq {
  page: number;
  page_size: number;
  ordering: string;
}

export interface APIPOPurchaseRow {
  id?: number; // ID only for new rows, not already existing ones
  subtotal: number;
  book: number;
  book_title: string;
  quantity: number;
  unit_wholesale_price: number;
}

export interface APIPO {
  vendor_name: string;
  id: number;
  date: string;
  vendor_id: number;
  purchases: APIPOPurchaseRow[];
  num_books: number;
  num_unique_books: number;
  total_cost: number;
}

export interface GetPOsResp {
  results: APIPO[];
  count: number;
}

// deletePurchaseOrders
export interface DeletePOReq {
  id: number;
}

// addPurchaseOrders
export interface AddPOReq {
  date: string;
  vendor: number;
  purchases: APIPOPurchaseRow[];
}

// modifyPurchaseOrders
export interface ModifyPOReq extends AddPOReq {
  id: number;
}

export const PURCHASES_API = {
  getPurchaseOrders: async function (req: GetPOsReq): Promise<GetPOsResp> {
    return await API.request({
      url: PURCHASES_EXTENSION,
      method: METHOD_GET,
      params: req,
    });
  },

  // Everything below this point has not been tested

  deletePurchaseOrder: async function (req: DeletePOReq) {
    return await API.request({
      url: PURCHASES_EXTENSION.concat("/".concat(req.id.toString())),
      method: METHOD_DELETE,
    });
  },

  modifyPurchaseOrder: async function (req: ModifyPOReq) {
    return await API.request({
      url: PURCHASES_EXTENSION.concat("/".concat(req.id.toString())),
      method: METHOD_PATCH,
      data: req,
    });
  },

  addPurchaseOrder: async function (req: AddPOReq) {
    return await API.request({
      url: PURCHASES_EXTENSION,
      method: METHOD_POST,
      data: req,
    });
  },
};
