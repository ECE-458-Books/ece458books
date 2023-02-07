import { API, METHOD_POST, METHOD_PUT } from "./Config";

const AUTH_EXTENSION = "auth";

export const AUTH_API = {
  login: async function (password: string) {
    return await API.request({
      url: AUTH_EXTENSION.concat("/users/login"),
      method: METHOD_POST,
      data: {
        email: "hosung.kim@duke.edu",
        password: password,
      },
    });
  },

  passwordChange: async function (old: string, pw: string, pw2: string) {
    return await API.request({
      url: AUTH_EXTENSION.concat("/change_password/admin"),
      method: METHOD_PUT,
      data: {
        old_password: old,
        password: pw,
        password2: pw2,
      },
    });
  },
};
