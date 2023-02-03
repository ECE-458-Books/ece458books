import React, { FormEvent } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";

interface GenreAddState {
  value: string;
}

class GenreAdd extends React.Component<{}, GenreAddState> {
  constructor(props = {}) {
    super(props);
    this.state = { value: "" };
  }

  onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    alert("A form was submitted: \n" + this.state.value);
  };

  render() {
    return (
      <div>
        <form onSubmit={this.onSubmit}>
          <label htmlFor="addgenre">Add Genres</label>
          <InputTextarea
            id="addgenre"
            name="addgenre"
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

export default GenreAdd;
