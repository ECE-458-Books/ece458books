import { createRef, FormEvent, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Messages } from "primereact/messages";
import { AUTH_API } from "../../apis/AuthAPI";
import { Toast } from "primereact/toast";
import { logger } from "../../util/Logger";

export default function PasswordChangePage() {
  const wrongPasswordRef = createRef<Messages>();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword1, setNewPassword1] = useState("");
  const [newPassword2, setNewPassword2] = useState("");

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  const showSuccess = () => {
    toast.current?.show({ severity: "success", summary: "Password Changed" });
  };

  const showFailure = (message: string) => {
    toast.current?.show({ severity: "error", summary: message });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    logger.debug("Password Change Clicked");
    AUTH_API.passwordChange(oldPassword, newPassword1, newPassword2).then(
      (response) => {
        // TODO: Refactor this
        if (response.data?.status) {
          showSuccess();
        } else {
          showFailure("Error");
        }
      }
    );
    event.preventDefault();
  };

  return (
    <div className="grid flex justify-content-center">
      <div className="col-5">
        <div className="py-5">
          <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
            Password Change
          </h1>
        </div>
        <form onSubmit={onSubmit}>
          <Toast ref={toast} />

          <div className="flex flex-row justify-content-center card-container col-12">
            <div className="pt-2 pr-2">
              <label
                className="text-xl p-component text-teal-800 p-text-secondary"
                htmlFor="genre"
              >
                Old Password:
              </label>
            </div>
            <InputText
              value={oldPassword}
              onChange={(event: FormEvent<HTMLInputElement>) =>
                setOldPassword(event.currentTarget.value)
              }
            />
          </div>

          <div className="flex flex-row justify-content-center card-container col-12">
            <div className="pt-2 pr-2">
              <label
                className="text-xl p-component text-teal-800 p-text-secondary"
                htmlFor="genre"
              >
                New Password:
              </label>
            </div>
            <InputText
              value={newPassword1}
              onChange={(event: FormEvent<HTMLInputElement>) =>
                setNewPassword1(event.currentTarget.value)
              }
            />
          </div>

          <div className="flex flex-row justify-content-center card-container col-12">
            <div className="pt-2 pr-2">
              <label
                className="text-xl p-component text-teal-800 p-text-secondary"
                htmlFor="genre"
              >
                New Password Confirm:
              </label>
            </div>
            <InputText
              value={newPassword2}
              onChange={(event: FormEvent<HTMLInputElement>) =>
                setNewPassword2(event.currentTarget.value)
              }
            />
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
    </div>
  );
}
