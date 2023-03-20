import { Divider } from "primereact/divider";
import {
  containsLowercase,
  containsNumber,
  containsUppercase,
} from "./PWCheck";

const PASSWORD_LENGTH = 8;

export const pwCheckHeader = (
  <div className="font-bold mb-3">Pick a password</div>
);
export const pwCheckFooter = (
  <>
    <Divider />
    <p className="mt-2">Suggestions</p>
    <ul className="pl-2 ml-2 mt-0 line-height-3">
      <li>At least one lowercase</li>
      <li>At least one uppercase</li>
      <li>At least one numeric</li>
      <li>Minimum 8 characters</li>
    </ul>
  </>
);

export function passwordValueCheck(
  password1: string,
  password2: string
): [boolean, string] {
  if (password1 === password2) {
    if (
      password1.length >= PASSWORD_LENGTH &&
      password2.length >= PASSWORD_LENGTH
    ) {
      if (containsUppercase(password1) && containsUppercase(password2)) {
        if (containsLowercase(password1) && containsLowercase(password2)) {
          if (containsNumber(password1) && containsNumber(password2)) {
            return [true, "Passwords matched"];
          } else {
            return [false, "New Password does not contain number"];
          }
        } else {
          return [false, "New Password does not contain lowercase letter"];
        }
      } else {
        return [false, "New Password does not contain uppercase letter"];
      }
    } else {
      return [false, "New Password is incorrect length"];
    }
  } else {
    return [false, "New Password fields do not match"];
  }
}
