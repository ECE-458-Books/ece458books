import { createRef, FormEvent, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Messages } from "primereact/messages";
import { AUTH_API } from "../../apis/auth/AuthAPI";
import { Toast } from "primereact/toast";
import { logger } from "../../util/Logger";
import { Password } from "primereact/password";
import {
  passwordValueCheck,
  pwCheckFooter,
  pwCheckHeader,
} from "../../util/PWValueCheck";
import { showFailure, showSuccess } from "../../components/Toast";

export default function PasswordChangePage() {
  const wrongPasswordRef = createRef<Messages>();
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword1, setNewPassword1] = useState<string>("");
  const [newPassword2, setNewPassword2] = useState<string>("");

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    logger.debug("Password Change Clicked");
    const pwCheckRet = passwordValueCheck(newPassword1, newPassword2);
    if (pwCheckRet[0]) {
      AUTH_API.passwordChange({
        old_password: oldPassword,
        password: newPassword1,
        password2: newPassword2,
      })
        .then(() => {
          showSuccess(toast, "Password Changed");
        })
        .catch(() => {
          showFailure(toast, "Password Could Not Be Changed");
        });
    } else {
      showFailure(toast, pwCheckRet[1]);
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
              header={pwCheckHeader}
              footer={pwCheckFooter}
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
            className="p-button-raised p-button-success"
          />
        </div>

        <Messages ref={wrongPasswordRef} />
      </form>
    </div>
  );
}
