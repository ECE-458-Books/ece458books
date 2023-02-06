import { PurchaseOrder } from "../pages/list/POList";
import {
  API,
  METHOD_DELETE,
  METHOD_GET,
  METHOD_PATCH,
  METHOD_POST,
} from "./Config";

const PURCHASES_EXTENSION = "purchases";

interface GetPurchaseOrdersReq {
  page: number;
  page_size: number;
  ordering_field: string | undefined;
  ordering_ascending: number | null | undefined;
  search: string;
}

// The structure of the response for a PO from the API
interface APIPurchaseOrder {
  id: number;
  name: string;
}

export interface GetPurchaseOrdersResp {
  purchaseOrders: PurchaseOrder[];
  numberOfPurchaseOrders: number;
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
        ordering: req.ordering_field,
        search: req.search,
      },
    });

    // Convert response to internal data type (not strictly necessary, but I think good practice)
    const purchases = response.data.results.map((pr: APIPurchaseOrder) => {
      return {
        id: pr.id,
        name: pr.name,
      };
    });

    return Promise.resolve({
      purchaseOrders: purchases,
      numberOfPurchaseOrders: response.data.count,
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

  addPurchaseOrder: async function (po: string) {
    await API.request({
      url: PURCHASES_EXTENSION,
      method: METHOD_POST,
      data: { name: po },
    });
  },
};
