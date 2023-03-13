import { AccessType } from "./UserTypes";

export function LogoutUser(onLogout: (user: AccessType | undefined) => void) {
  onLogout(undefined);
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userID");
  localStorage.removeItem("loginTime");
  localStorage.removeItem("refreshToken");
}
