import React from "react";
import { FormEvent } from "react";
import axios from "axios";

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
    const loginPayload = {
      email: "eve.holt@reqres.in",
      password: "cityslicka",
    };

    axios.post("API LINK", loginPayload).then((response) => {
      //get token from response
      const token = response.data.token;
      console.log(token)

      //set JWT token to local
      localStorage.setItem("token", token);

      //set token to axios common header
      this.setAuthToken(token);
    });

    alert("A password was submitted: " + this.state.value);

    event.preventDefault();
  };

  setAuthToken(token: "string") {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else delete axios.defaults.headers.common["Authorization"];
  }

  render() {
    return (
      <form onSubmit={(e: FormEvent<HTMLFormElement>) => this.onSubmit(e)}>
        <label>
          Password:
          <input
            type="text"
            value={this.state.value}
            onChange={(e: FormEvent<HTMLInputElement>) => this.onChange(e)}
          />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}

export default LoginPage;
