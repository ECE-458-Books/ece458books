import { User } from "../../pages/users/UserList";
import { APIUser } from "./UserAPI";

// User

export const APIUserSortFieldMap = new Map<string, string>([
  ["userName", "username"],
  ["isAdmin", "is_staff"],
]);

export function APIToInternalUserConversion(user: APIUser): User {
  return {
    id: user.id.toString(),
    userName: user.username,
    isAdmin: user.is_staff,
  };
}
