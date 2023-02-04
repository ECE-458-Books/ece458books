import React, { FormEvent } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";

interface GenreAddState {
  inputBoxText: string;
}

class GenreAdd extends React.Component<{}, GenreAddState> {
  constructor(props = {}) {
    super(props);
    this.state = { inputBoxText: "" };
  }

  onSubmit = (): void => {
    alert("A form was submitted: \n" + this.state.inputBoxText);
  };

  render() {
    return (
      <div>
        <form onSubmit={this.onSubmit}>
          <label htmlFor="addgenre">Add Genres</label>
          <InputTextarea
            id="addgenre"
            name="addgenre"
            value={this.state.inputBoxText}
            onChange={(e: FormEvent<HTMLTextAreaElement>) =>
              this.setState({ inputBoxText: e.currentTarget.value })
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
