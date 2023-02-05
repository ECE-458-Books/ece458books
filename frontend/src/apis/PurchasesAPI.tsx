import { PurchaseOrder } from "../pages/list/POList";
import {
  API,
  METHOD_DELETE,
  METHOD_GET,
  METHOD_PATCH,
  METHOD_POST,
} from "./Config";

const PURCHASES_EXTENSION = "purchases/";

interface GetPOReq {
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

export interface GetPOResp {
  purchaseOrders: PurchaseOrder[];
  numberOfPOs: number;
}

export const PURCHASES_API = {
  getPOs: async function (req: GetPOReq): Promise<GetPOResp> {
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
      numberOfPOs: response.data.count,
    });
  },

  // Everything below this point has not been tested

  deletePO: async function (id: string) {
    await API.request({
      url: PURCHASES_EXTENSION.concat(id),
      method: METHOD_DELETE,
    });
  },

  modifyPO: async function (po: PurchaseOrder) {
    const poParams = {
      id: po.id,
    };

    await API.request({
      url: PURCHASES_EXTENSION.concat(po.id.toString()),
      method: METHOD_PATCH,
      data: poParams,
    });
  },

  addPO: async function (po: string) {
    await API.request({
      url: PURCHASES_EXTENSION,
      method: METHOD_POST,
      data: { name: po },
    });
  },
};
