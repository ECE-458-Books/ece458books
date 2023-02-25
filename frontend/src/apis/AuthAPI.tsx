import { API, METHOD_POST, METHOD_PUT } from "./Config";

const AUTH_EXTENSION = "auth";

// login
export interface LoginReq {
  password: string;
}

export interface LoginResp {
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
        email: "hosung.kim@duke.edu",
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

  // We don't know the format of the failed request
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tokenRefresh: async function (failedRequest: any) {
    const refreshToken = sessionStorage.getItem("refreshToken");

    API.request<never, RefreshTokenResp>({
      url: AUTH_EXTENSION.concat("/token/refresh"),
      method: METHOD_POST,
      data: {
        refresh: refreshToken,
      },
    })
      .then((response) => {
        sessionStorage.setItem("accessToken", response.access);
        failedRequest.response.config.headers["Authorization"] =
          "Bearer " + response.access;
        return Promise.resolve();
      })
      .catch((error) => {
        return error;
      });
  },
};
