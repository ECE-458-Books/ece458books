import React, { FormEvent } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button"

interface LoginState {
  value: string;
}

class LoginPage extends React.Component<{}, LoginState> {
  constructor(props = {}) {
    super(props);
    this.state = { value: "" };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChange = (event: FormEvent<HTMLInputElement>): void => {
    this.setState({ value: event.currentTarget.value });
  };

  onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    const reqOpts = {
      url: "http://books-front.colab.duke.edu:8000/api/v1/auth/token",
      headers: { "Content-Type": "application/json" },
      method: "POST",
      data: JSON.stringify({
        email: "crs79@duke.edu",
        password: this.state.value,
      }),
    };

    axios.request(reqOpts).then((response) => console.log(response.data));

    event.preventDefault();
  };

  setAuthToken(token: "string") {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else delete axios.defaults.headers.common["Authorization"];
  }

  render() {
    return (
      <form onSubmit = {this.onSubmit}>
        <InputText value={this.state.value} onChange={(this.onChange)} />
        <Button type="submit" label="Submit" aria-label="Submit" />
      </form>
  )}
}

export default LoginPage;
