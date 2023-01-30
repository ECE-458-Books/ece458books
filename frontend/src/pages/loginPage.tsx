import React, { createRef, FormEvent, } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button"
import { Messages } from 'primereact/messages';

interface LoginState {
  password: string;
}

class LoginPage extends React.Component<{}, LoginState> {
  private wrongPasswordRef: React.RefObject<Messages>
  constructor(props = {}) {
    super(props);
    this.state = { password: ""};
    this.wrongPasswordRef = createRef<Messages>()

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
        email: "hk196@duke.edu",
        password: this.state.password,
      }),
    };
    
    // Make the request, and show error message if password is wrong
    axios.request(reqOpts).then((response) => {
      if(response.data.access) {
        this.setAuthToken(response.data.access)
      } else {
        delete axios.defaults.headers.common["Authorization"];
      }
    }).catch((error) => {
      this.wrongPasswordRef.current?.show([
        { sticky: false, severity: 'error', summary: 'Error: Incorrect Password', closable: false, life: 3000}
      ])
    });

    event.preventDefault();
  };

  // Sets the default auth token used by axios
  setAuthToken(token: string) {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else delete axios.defaults.headers.common["Authorization"]; 
  }

  render() {
    return (
      <form onSubmit = {this.onSubmit}>
        <InputText value={this.state.password} onChange={(this.onChange)} />
        <Button type="submit" label="Submit" aria-label="Submit" />
        <Messages ref={this.wrongPasswordRef}/>
      </form>
  )}
}

export default LoginPage;
