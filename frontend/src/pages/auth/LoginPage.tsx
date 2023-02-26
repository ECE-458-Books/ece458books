import { createRef, FormEvent, useState } from "react";
import { Button } from "primereact/button";
import { Messages } from "primereact/messages";
import { useNavigate } from "react-router-dom";
import { API } from "../../apis/Config";
import { AUTH_API, LoginReq } from "../../apis/AuthAPI";
import { Password } from "primereact/password";

export default function LoginPage() {
  const navigate = useNavigate();
  const wrongPasswordRef = createRef<Messages>();
  const [password, setPassword] = useState<string>("");

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
    const req: LoginReq = {
      password: password,
    };

    AUTH_API.login(req)
      .then((response) => {
        setAuthToken(response.access);
        sessionStorage.setItem("refreshToken", response.refresh);
        sessionStorage.setItem("accessToken", response.access);
        navigate("/books");
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
    <div className="grid flex justify-content-center">
      <link
        rel="stylesheet"
        href="https://unpkg.com/primeflex@3.1.2/primeflex.css"
      ></link>
      <div className="col-5">
        <div className="py-5 col-12">
          <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
            Login Page
          </h1>
        </div>
        <div className="col-6 col-offset-5">
          <img
            alt="logo"
            src={require("../../ImaginarySoftwareLogo.jpeg")}
            height="200"
            className="mr-2"
          ></img>
        </div>
        <h1 className="p-component p-text-secondary text-xl text-center text-900 color: var(--surface-800);">
          Imaginary Software
        </h1>
        <form onSubmit={onSubmit}>
          <div className="flex flex-row justify-content-center card-container col-12">
            <Password
              value={password}
              onChange={onChange}
              toggleMask
              feedback={false}
            />
          </div>
          <div className="flex flex-row justify-content-center card-container col-12">
            <Button type="submit" label="Log In" aria-label="Submit" />
          </div>
          <Messages ref={wrongPasswordRef} />
        </form>
      </div>
    </div>
  );
}
