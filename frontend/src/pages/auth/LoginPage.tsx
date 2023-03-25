import { createRef, FormEvent, useState } from "react";
import { Button } from "primereact/button";
import { Messages } from "primereact/messages";
import { useNavigate } from "react-router-dom";
import { AUTH_API, LoginReq } from "../../apis/auth/AuthAPI";
import { Password } from "primereact/password";
import { InputText } from "primereact/inputtext";
import { AccessType, administrator, user } from "../../util/auth/UserTypes";

interface LoginPageProps {
  onLogin: (user: AccessType | undefined) => void;
}

export default function LoginPage(props: LoginPageProps) {
  const wrongPasswordRef = createRef<Messages>();
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // On password change
  const onChange = (event: FormEvent<HTMLInputElement>): void => {
    setPassword(event.currentTarget.value);
  };

  const navigate = useNavigate();

  // Hits the token endpoint, and stores the token in local storage. Displays incorrect password text if error returned from endpoint
  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    // Make the request, and show error message if password is wrong
    const req: LoginReq = {
      username: userName,
      password: password,
    };

    AUTH_API.login(req)
      .then((response) => {
        if (response.is_staff) {
          props.onLogin(administrator);
        } else {
          props.onLogin(user);
        }
        localStorage.setItem("accessToken", response.access);
        localStorage.setItem("loginTime", new Date().toString());
        localStorage.setItem("userID", response.id.toString());
        navigate("/books");
      })
      .catch(() => {
        wrongPasswordRef.current?.show([
          {
            sticky: false,
            severity: "error",
            summary: "Invalid Credentials",
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
      <div className="py-5 col-12">
        <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
          Login Page
        </h1>
      </div>
      <div className="flex col-12 justify-content-center">
        <img
          alt="logo"
          src={require("../../ImaginarySoftwareLogo.png")}
          height="200"
          className="mr-2"
        ></img>
      </div>
      <div className="col-12 justify-content-center">
        <h1 className="p-component p-text-secondary text-xl text-center text-900 color: var(--surface-800);">
          Imaginary Software
        </h1>
      </div>
      <form onSubmit={onSubmit} className="col-8">
        <div className="flex justify-content-center col-12">
          <div className="flex pr-2 col-5 justify-content-end my-auto">
            <label
              className="text-xl p-component text-teal-900 p-text-secondary"
              htmlFor="genre"
            >
              Username:
            </label>
          </div>
          <div className="col-7">
            <InputText
              value={userName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setUserName(e.target.value)
              }
            />
          </div>
        </div>

        <div className="flex justify-content-center col-12">
          <div className="flex pr-2 col-5 justify-content-end my-auto">
            <label
              className="text-xl p-component text-teal-900 p-text-secondary"
              htmlFor="genre"
            >
              Password:
            </label>
          </div>
          <div className="col-7">
            <Password
              value={password}
              onChange={onChange}
              toggleMask
              feedback={false}
            />
          </div>
        </div>

        <div className="flex justify-content-center col-12">
          <Button type="submit" label="Log In" aria-label="Submit" />
        </div>
        <Messages ref={wrongPasswordRef} />
      </form>
    </div>
  );
}
