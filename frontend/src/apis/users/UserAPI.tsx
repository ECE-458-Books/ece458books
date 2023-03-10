import {
  API,
  METHOD_DELETE,
  METHOD_GET,
  METHOD_PATCH,
  METHOD_POST,
} from "../Config";

const USER_EXTENSION = "auth/users";

export interface APIUser {
  id: number;
  username: string;
  is_staff: boolean;
}

// getBookDetail
export interface GetUserDetailReq {
  id: string;
}

// deleteBook
export interface DeleteUserReq {
  id: string;
}

// modifyGenre
export interface ModifyUserReq {
  id: string;
  password_1: string;
  password_2: string;
  is_staff: boolean;
}

// addGenre
export interface AddUserReq {
  username: string;
  password_1: string;
  password_2: string;
  is_staff: boolean;
}

export const USER_API = {
  getUserDetail: async function (req: GetUserDetailReq): Promise<APIUser> {
    return await API.request({
      url: USER_EXTENSION.concat("/".concat(req.id.toString())),
      method: METHOD_GET,
    });
  },

  deleteUser: async function (req: DeleteUserReq) {
    return await API.request({
      url: USER_EXTENSION.concat("/".concat(req.id.toString())),
      method: METHOD_DELETE,
    });
  },

  modifyUser: async function (req: ModifyUserReq) {
    return await API.request({
      url: USER_EXTENSION.concat("/".concat(req.id.toString())),
      method: METHOD_PATCH,
      data: req,
    });
  },

  addUser: async function (req: AddUserReq) {
    return await API.request({
      url: USER_EXTENSION,
      method: METHOD_POST,
      data: req,
    });
  },
};
