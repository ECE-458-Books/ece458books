import React from 'react';
import { FormEvent } from 'react';

interface LoginState {
  value: string
}

class LoginPage extends React.Component<{}, LoginState> {
  constructor(props = {}) {
    super(props);
    this.state = {value: ''};

    //this.handleChange = this.handleChange.bind(this);
    //this.handleSubmit = this.handleSubmit.bind(this);
  }

  onChange = (event: FormEvent<HTMLInputElement>): void => {
    this.setState({value: event.currentTarget.value});
  }

  onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    alert('A password was submitted: ' + this.state.value);

    

    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={(e: FormEvent<HTMLFormElement>) => this.onSubmit(e)}>
        <label>
          Password:
          <input type="text" value={this.state.value} 
            onChange={(e: FormEvent<HTMLInputElement>) => this.onChange(e)} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}

export default LoginPage;
