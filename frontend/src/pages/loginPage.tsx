import React, { FormEvent } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button"

interface LoginState {
  password: string;
}

class LoginPage extends React.Component<{}, LoginState> {
  constructor(props = {}) {
    super(props);
    this.state = { password: "" };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChange = (event: FormEvent<HTMLInputElement>): void => {
    this.setState({ password: event.currentTarget.value });
  };

  onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    const reqOpts = {
      url: "http://books-front.colab.duke.edu:8000/api/v1/auth/token/",
      headers: { "Content-Type": "application/json" },
      method: "POST",
      data: JSON.stringify({
        email: "crs79@duke.edu",
        password: this.state.password,
      }),
    };

    axios.request(reqOpts).then((response) => this.setAuthToken(response.data.access));

    event.preventDefault();
  };

  setAuthToken(token: string) {
    console.log(token)
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else delete axios.defaults.headers.common["Authorization"];
  }

  render() {
    return (
      <form onSubmit = {this.onSubmit}>
        <InputText value={this.state.password} onChange={(this.onChange)} />
        <Button type="submit" label="Submit" aria-label="Submit" />
      </form>
  )}
}

export default LoginPage;
