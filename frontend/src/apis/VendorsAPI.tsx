import { Vendor } from "../pages/list/VendorList";
import {
  API,
  METHOD_DELETE,
  METHOD_GET,
  METHOD_PATCH,
  METHOD_POST,
} from "./Config";

const VENDORS_EXTENSION = "vendors";

interface GetVendorsReq {
  page: number;
  page_size: number;
  ordering: string;
}

// The structure of the response for a vendor from the API
interface APIVendor {
  id: number;
  name: string;
  num_purchase_orders: number;
}

export interface GetVendorsResp {
  vendors: Vendor[];
  numberOfVendors: number;
}

export interface GetVendorsNoCountResp {
  vendors: Vendor[];
}

export const VENDORS_API = {
  getVendors: async function (req: GetVendorsReq): Promise<GetVendorsResp> {
    const response = await API.request({
      url: VENDORS_EXTENSION,
      method: METHOD_GET,
      params: {
        page: req.page + 1,
        page_size: req.page_size,
        ordering: req.ordering,
      },
    });

    // Convert response to internal data type (not strictly necessary, but I think good practice)
    const vendors = response.data.results.map((vendor: APIVendor) => {
      return {
        id: vendor.id,
        name: vendor.name,
        numPO: vendor.num_purchase_orders,
      };
    });

    return Promise.resolve({
      vendors: vendors,
      numberOfVendors: response.data.count,
    });
  },

  getVendorsNOPaging: async function (): Promise<GetVendorsNoCountResp> {
    const response = await API.request({
      url: VENDORS_EXTENSION,
      method: METHOD_GET,
      params: {
        no_pagination: true,
      },
    });

    // Convert response to internal data type (not strictly necessary, but I think good practice)
    const vendors = response.data.results.map((vendor: APIVendor) => {
      return {
        id: vendor.id,
        name: vendor.name,
      };
    });

    return Promise.resolve({
      vendors: vendors,
    });
  },

  // Everything below this point has not been tested

  deleteVendor: async function (id: string) {
    return await API.request({
      url: VENDORS_EXTENSION.concat("/".concat(id)),
      method: METHOD_DELETE,
    });
  },

  modifyVendor: async function (vendor: Vendor) {
    const vendorParams = {
      id: vendor.id,
      name: vendor.name,
    };

    return await API.request({
      url: VENDORS_EXTENSION.concat("/".concat(vendor.id.toString())),
      method: METHOD_PATCH,
      data: vendorParams,
    });
  },

  addVendor: async function (vendor: string) {
    return await API.request({
      url: VENDORS_EXTENSION,
      method: METHOD_POST,
      data: { name: vendor },
    });
  },
};
