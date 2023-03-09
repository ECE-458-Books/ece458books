import { API, METHOD_POST, METHOD_PUT } from "../Config";

const AUTH_EXTENSION = "auth";

// login
export interface LoginReq {
  username: string;
  password: string;
}

export interface LoginResp {
  id: number;
  is_staff: boolean;
  refresh: string;
  access: string;
}

// passwordChange
export interface PasswordChangeReq {
  old_password: string;
  password: string;
  password2: string;
}

export interface PasswordChangeResp {
  status: string;
}

// refreshToken
export interface RefreshTokenResp {
  access: string;
}

export const AUTH_API = {
  login: async function (req: LoginReq): Promise<LoginResp> {
    return await API.request({
      url: AUTH_EXTENSION.concat("/users/login"),
      method: METHOD_POST,
      data: {
        email: req.username,
        password: req.password,
      },
    });
  },

  passwordChange: async function (req: PasswordChangeReq) {
    return await API.request({
      url: AUTH_EXTENSION.concat("/change_password/admin"),
      method: METHOD_PUT,
      data: req,
    });
  },
};
