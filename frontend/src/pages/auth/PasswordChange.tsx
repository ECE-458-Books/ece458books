import { createRef, FormEvent, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Messages } from "primereact/messages";
import { AUTH_API } from "../../apis/auth/AuthAPI";
import { Toast } from "primereact/toast";
import { logger } from "../../util/Logger";
import { Password } from "primereact/password";
import { Divider } from "primereact/divider";
import {
  containsLowercase,
  containsNumber,
  containsUppercase,
} from "../../util/PWCheck";

export default function PasswordChangePage() {
  const wrongPasswordRef = createRef<Messages>();
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword1, setNewPassword1] = useState<string>("");
  const [newPassword2, setNewPassword2] = useState<string>("");

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  const showSuccess = () => {
    toast.current?.show({ severity: "success", summary: "Password Changed" });
  };

  const showFailure = (message: string) => {
    toast.current?.show({ severity: "error", summary: message });
  };

  const header = <div className="font-bold mb-3">Pick a password</div>;
  const footer = (
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

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    logger.debug("Password Change Clicked");
    if (newPassword1 === newPassword2) {
      if (newPassword1.length > 7 && newPassword2.length > 7) {
        if (
          containsUppercase(newPassword1) &&
          containsUppercase(newPassword2)
        ) {
          if (
            containsLowercase(newPassword1) &&
            containsLowercase(newPassword2)
          ) {
            if (containsNumber(newPassword1) && containsNumber(newPassword2)) {
              AUTH_API.passwordChange({
                old_password: oldPassword,
                password: newPassword1,
                password2: newPassword2,
              }).then((response) => {
                // TODO: Refactor this
                if (response.data?.status) {
                  showSuccess();
                } else {
                  showFailure("Error");
                }
              });
            } else {
              showFailure("New Password does not contain number");
            }
          } else {
            showFailure("New Password does not contain lowercase letter");
          }
        } else {
          showFailure("New Password does not contain uppercase letter");
        }
      } else {
        showFailure("New Password is incorrect length");
      }
    } else {
      showFailure("New Password fields do not the match");
    }
    event.preventDefault();
  };

  return (
    <div className="grid flex justify-content-center">
      <Toast ref={toast} />
      <div className="col-12 py-5">
        <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
          Password Change
        </h1>
      </div>
      <form onSubmit={onSubmit}>
        <div className="flex col-12 justify-content-center">
          <div className="flex pr-2 col-5 justify-content-end my-auto">
            <label
              className="text-xl p-component text-teal-900 p-text-secondary"
              htmlFor="genre"
            >
              Old Password:
            </label>
          </div>
          <div className="col-7">
            <Password
              value={oldPassword}
              onChange={(event: FormEvent<HTMLInputElement>) =>
                setOldPassword(event.currentTarget.value)
              }
              toggleMask
              feedback={false}
            />
          </div>
        </div>

        <div className="flex col-12 justify-content-center">
          <div className="flex pr-2 col-5 justify-content-end my-auto">
            <label
              className="text-xl p-component text-teal-900 p-text-secondary"
              htmlFor="genre"
            >
              New Password:
            </label>
          </div>
          <div className="col-7">
            <Password
              value={newPassword1}
              onChange={(event: FormEvent<HTMLInputElement>) =>
                setNewPassword1(event.currentTarget.value)
              }
              toggleMask
              header={header}
              footer={footer}
              promptLabel="Choose a password"
              weakLabel="Too simple"
              mediumLabel="Average complexity"
              strongLabel="Complex password"
            />
          </div>
        </div>

        <div className="flex col-12 justify-content-center">
          <div className="flex pr-2 col-5 justify-content-end text-right my-auto">
            <label
              className="text-xl p-component text-teal-900 p-text-secondary"
              htmlFor="genre"
            >
              New Password Confirm:
            </label>
          </div>
          <div className="col-7">
            <Password
              value={newPassword2}
              onChange={(event: FormEvent<HTMLInputElement>) =>
                setNewPassword2(event.currentTarget.value)
              }
              toggleMask
              feedback={false}
            />
          </div>
        </div>
        <div className="flex flex-row justify-content-center card-container col-12">
          <Button
            type="submit"
            label="Submit"
            aria-label="Submit"
            className="p-button-raised"
          />
        </div>

        <Messages ref={wrongPasswordRef} />
      </form>
    </div>
  );
}
