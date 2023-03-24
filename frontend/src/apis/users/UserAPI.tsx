import {
  API,
  METHOD_DELETE,
  METHOD_GET,
  METHOD_PATCH,
  METHOD_POST,
} from "../Config";

const USERS_EXTENSION = "auth/users";
const USER_EXTENSION = "auth/user";

// getUsers
export interface GetUsersReq {
  no_pagination?: boolean;
  page?: number;
  page_size?: number;
  ordering: string;
}

export interface APIUser {
  id: number;
  username: string;
  is_staff: boolean;
}

export interface GetUsersResp {
  results: APIUser[];
  count: number;
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
  password: string;
  password2: string;
  is_staff: boolean;
}

// addGenre
export interface AddUserReq {
  username: string;
  password: string;
  password2: string;
  is_staff: boolean;
}

export interface UserTypeResp {
  is_staff: boolean;
}

export const USER_API = {
  getUsers: async function (req: GetUsersReq): Promise<GetUsersResp> {
    return await API.request({
      url: USERS_EXTENSION,
      method: METHOD_GET,
      params: req,
    });
  },

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
      url: USERS_EXTENSION.concat("/".concat("register")),
      method: METHOD_POST,
      data: req,
    });
  },

  getUserType: async function (): Promise<UserTypeResp> {
    return await API.request({
      url: USER_EXTENSION,
      method: METHOD_GET,
    });
  },
};
