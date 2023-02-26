import { API, METHOD_GET } from "./Config";

const IMAGE_EXTENSION = "books";

// get image requirement
export interface GetImageReq {
  id: string;
}

// get image response
export interface GetImageResp {
  url: string;
  book: number;
}

// upload image requirement
export interface UploadImageReq {
  id: string;
  image: File;
}

export const IMAGES_API = {
  getImage: async function (req: GetImageReq): Promise<GetImageResp> {
    return await API.request({
      url: IMAGE_EXTENSION.concat("/").concat(req.id),
      method: METHOD_GET,
    });
  },
};
