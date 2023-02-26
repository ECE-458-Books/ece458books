import { API, METHOD_GET, METHOD_PATCH } from "./Config";

const IMAGE_EXTENSION = "books/image";

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
      url: IMAGE_EXTENSION.concat("/").concat(req.id.toString()),
      method: METHOD_GET,
    });
  },

  uploadImage: async function (req: UploadImageReq) {
    const formData = new FormData();
    formData.append("image", req.image);
    console.log(formData);
    return await API.request({
      url: IMAGE_EXTENSION.concat("/").concat(req.id.toString()),
      method: METHOD_PATCH,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: formData,
    });
  },
};
