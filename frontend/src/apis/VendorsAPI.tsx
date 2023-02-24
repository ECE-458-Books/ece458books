import {
  API,
  METHOD_DELETE,
  METHOD_GET,
  METHOD_PATCH,
  METHOD_POST,
} from "./Config";

const VENDORS_EXTENSION = "vendors";
// getVendors
export interface GetVendorsReq {
  page: number;
  page_size: number;
  ordering: string;
}

export interface APIVendor {
  id: number;
  name: string;
  num_purchase_orders: number;
}

export interface GetVendorsResp {
  results: APIVendor[];
  count: number;
}

// getVendorDetail
export interface GetVendorDetailReq {
  id: string;
}

// deleteVendor
export interface DeleteVendorReq {
  id: string;
}

// modifyVendor
export interface ModifyVendorReq {
  id: string;
  name: string;
}

// addVendor
export interface AddVendorReq {
  name: string;
}

export const VENDORS_API = {
  getVendors: async function (req: GetVendorsReq): Promise<GetVendorsResp> {
    return await API.request({
      url: VENDORS_EXTENSION,
      method: METHOD_GET,
      params: req,
    });
  },

  getVendorDetail: async function (
    req: GetVendorDetailReq
  ): Promise<APIVendor> {
    return await API.request({
      url: VENDORS_EXTENSION.concat("/".concat(req.id.toString())),
      method: METHOD_GET,
    });
  },

  getVendorsNoPagination: async function (): Promise<APIVendor[]> {
    return await API.request({
      url: VENDORS_EXTENSION,
      method: METHOD_GET,
      params: {
        no_pagination: true,
      },
    });
  },

  deleteVendor: async function (req: DeleteVendorReq) {
    return await API.request({
      url: VENDORS_EXTENSION.concat("/".concat(req.id.toString())),
      method: METHOD_DELETE,
    });
  },

  modifyVendor: async function (req: ModifyVendorReq) {
    return await API.request({
      url: VENDORS_EXTENSION.concat("/".concat(req.id.toString())),
      method: METHOD_PATCH,
      data: req,
    });
  },

  addVendor: async function (req: AddVendorReq) {
    return await API.request({
      url: VENDORS_EXTENSION,
      method: METHOD_POST,
      data: req,
    });
  },
};
