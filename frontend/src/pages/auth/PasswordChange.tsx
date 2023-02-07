import { createRef, FormEvent, useState } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Messages } from "primereact/messages";
import { useNavigate } from "react-router-dom";
import { API } from "../../apis/Config";
import { AUTH_API } from "../../apis/AuthAPI";

export default function PasswordChangePage() {
  const navigate = useNavigate();
  const wrongPasswordRef = createRef<Messages>();
  const [password, setPassword] = useState("");

  // Sets the default auth token used by axios
  const setAuthToken = (token: string) => {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  // On password change
  const onChange = (event: FormEvent<HTMLInputElement>): void => {
    setPassword(event.currentTarget.value);
  };

  // Hits the token endpoint, and stores the token in local storage. Displays incorrect password text if error returned from endpoint
  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    // Make the request, and show error message if password is wrong
    AUTH_API.login(password)
      .then((response) => {
        if (response.data.access) {
          setAuthToken(response.data.access);
          navigate("/books");
        } else {
          delete axios.defaults.headers.common["Authorization"];
        }
      })
      .catch(() => {
        wrongPasswordRef.current?.show([
          {
            sticky: false,
            severity: "error",
            summary: "Error: Incorrect Password",
            closable: false,
            life: 3000,
          },
        ]);
      });

    event.preventDefault();
  };

  return (
    <form onSubmit={onSubmit}>
      <InputText value={password} onChange={onChange} />
      <Button type="submit" label="Submit" aria-label="Submit" />
      <Messages ref={wrongPasswordRef} />
    </form>
  );
}
