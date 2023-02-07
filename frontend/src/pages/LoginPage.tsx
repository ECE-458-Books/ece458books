import React, { createRef, FormEvent } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Messages } from "primereact/messages";
import NavigateFunction from "react-router-dom";
import { API } from "../apis/Config";

interface LoginProps {
  navigator: NavigateFunction.NavigateFunction;
}

interface LoginState {
  password: string;
}

class LoginPage extends React.Component<LoginProps, LoginState> {
  private wrongPasswordRef: React.RefObject<Messages>;
  constructor(props: LoginProps) {
    super(props);
    this.state = { password: "" };
    this.wrongPasswordRef = createRef<Messages>();

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChange = (event: FormEvent<HTMLInputElement>): void => {
    this.setState({ password: event.currentTarget.value });
  };

  // Hits the token endpoint, and stores the token in local storage. Displays incorrect password text if error returned from endpoint
  onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    const reqOpts = {
      url: process.env.REACT_APP_API_ENDPOINT_TOKEN,
      headers: { "Content-Type": "application/json" },
      method: "POST",
      data: JSON.stringify({
        email: "hosung.kim@duke.edu",
        password: this.state.password,
      }),
    };

    // Make the request, and show error message if password is wrong
    axios
      .request(reqOpts)
      .then((response) => {
        if (response.data.access) {
          this.setAuthToken(response.data.access);
          this.props.navigator("/books");
        } else {
          delete axios.defaults.headers.common["Authorization"];
        }
      })
      .catch(() => {
        this.wrongPasswordRef.current?.show([
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

  // Sets the default auth token used by axios
  setAuthToken(token: string) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  render() {
    return (
      <div className="grid flex justify-content-center">
        <link
          rel="stylesheet"
          href="https://unpkg.com/primeflex@3.1.2/primeflex.css"
        ></link>
        <div className="col-5">
          <div className="py-5">
            <h1 className="text-center text-900 color: var(--surface-800);">
              Login Page
            </h1>
          </div>
          <form onSubmit={this.onSubmit}>
            <div className="flex flex-row justify-content-center card-container col-12">
              <InputText value={this.state.password} onChange={this.onChange} />
            </div>
            <div className="flex flex-row justify-content-center card-container col-12">
              <Button type="submit" label="Sign In" aria-label="Log" />
            </div>
            <Messages ref={this.wrongPasswordRef} />
          </form>
        </div>
      </div>
    );
  }
}

export default LoginPage;
