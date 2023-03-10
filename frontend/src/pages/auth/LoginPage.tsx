import { createRef, FormEvent, SetStateAction, useState } from "react";
import { Button } from "primereact/button";
import { Messages } from "primereact/messages";
import { useNavigate } from "react-router-dom";
import { AUTH_API, LoginReq } from "../../apis/auth/AuthAPI";
import { Password } from "primereact/password";

export interface AccessType {
  userType: string;
  permissions: string[];
}

const noRights: AccessType = {
  userType: "No Rights",
  permissions: [],
};

const user: AccessType = {
  userType: "User",
  permissions: [],
};

const administrator: AccessType = {
  userType: "Administrator",
  permissions: [
    "list.elements",
    "add.element",
    "delete.element",
    "modify.element",
  ],
};

interface LoginPageProps {
  onLogin: (user: AccessType) => void;
}

export default function LoginPage(props: LoginPageProps) {
  const navigate = useNavigate();
  const wrongPasswordRef = createRef<Messages>();
  const [password, setPassword] = useState<string>("");

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
        localStorage.setItem("accessToken", response.access);
        localStorage.setItem("loginTime", new Date().toString());
        props.onLogin(administrator);
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
      <form onSubmit={onSubmit}>
        <div className="flex justify-content-center col-12">
          <Password
            value={password}
            onChange={onChange}
            toggleMask
            feedback={false}
          />
        </div>
        <div className="flex justify-content-center col-12">
          <Button type="submit" label="Log In" aria-label="Submit" />
        </div>
        <Messages ref={wrongPasswordRef} />
      </form>
    </div>
  );
}
