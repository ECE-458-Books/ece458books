import { SalesReconciliation } from "../pages/list/SRList";
import {
  API,
  METHOD_DELETE,
  METHOD_GET,
  METHOD_PATCH,
  METHOD_POST,
} from "./Config";

const SALES_EXTENSION = "sales/";

interface GetSalesReq {
  page: number;
  page_size: number;
  ordering_field: string | undefined;
  ordering_ascending: number | null | undefined;
  search: string;
}

// The structure of the response for a SR from the API
interface APISalesReconciliation {
  id: number;
  name: string;
}

export interface GetSalesResp {
  salesReconciliations: SalesReconciliation[];
  numberOfSRs: number;
}

export const SALES_API = {
  getSRs: async function (req: GetSalesReq): Promise<GetSalesResp> {
    const response = await API.request({
      url: SALES_EXTENSION,
      method: METHOD_GET,
      params: {
        page: req.page + 1,
        page_size: req.page_size,
        ordering: req.ordering_field,
        search: req.search,
      },
    });

    // Convert response to internal data type (not strictly necessary, but I think good practice)
    const sales = response.data.results.map((sr: APISalesReconciliation) => {
      return {
        id: sr.id,
        name: sr.name,
      };
    });

    return Promise.resolve({
      salesReconciliations: sales,
      numberOfSRs: response.data.count,
    });
  },

  // Everything below this point has not been tested

  deleteSR: async function (id: string) {
    await API.request({
      url: SALES_EXTENSION.concat(id),
      method: METHOD_DELETE,
    });
  },

  modifySR: async function (sr: SalesReconciliation) {
    const srParams = {
      id: sr.id,
    };

    await API.request({
      url: SALES_EXTENSION.concat(sr.id.toString()),
      method: METHOD_PATCH,
      data: srParams,
    });
  },

  addSR: async function (sr: string) {
    await API.request({
      url: SALES_EXTENSION,
      method: METHOD_POST,
      data: { name: sr },
    });
  },
};
