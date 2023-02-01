import React, { FormEvent } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";

interface BookAddState {
  value: string;
}

class BookAdd extends React.Component<{}, BookAddState> {
  constructor(props = {}) {
    super(props);
    this.state = { value: "" };
  }

  onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    alert("A form was submitted: \n" + this.state.value);

    event.preventDefault();
  };

  render() {
    return (
      <div>
        <form onSubmit={this.onSubmit}>
          <label htmlFor="addbook">Add Books (ISBN'S)</label>
          <InputTextarea
            id="addbook"
            name="addbook"
            value={this.state.value}
            onChange={(e: FormEvent<HTMLTextAreaElement>) =>
              this.setState({ value: e.currentTarget.value })
            }
            rows={5}
            cols={30}
          />
          <Button label="submit" type="submit" />
        </form>
      </div>
    );
  }
}

export default BookAdd;
