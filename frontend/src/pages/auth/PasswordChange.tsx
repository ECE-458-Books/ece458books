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
    <form onSubmit={onSubmit}>
      <Toast ref={toast} />

      <InputText
        value={oldPassword}
        onChange={(event: FormEvent<HTMLInputElement>) =>
          setOldPassword(event.currentTarget.value)
        }
      />

      <InputText
        value={newPassword1}
        onChange={(event: FormEvent<HTMLInputElement>) =>
          setNewPassword1(event.currentTarget.value)
        }
      />

      <InputText
        value={newPassword2}
        onChange={(event: FormEvent<HTMLInputElement>) =>
          setNewPassword2(event.currentTarget.value)
        }
      />
      <Button type="submit" label="Submit" aria-label="Submit" />
      <Messages ref={wrongPasswordRef} />
    </form>
  );
}
