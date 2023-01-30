import React, { FormEvent } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ToggleButton } from "primereact/togglebutton";

interface modifyGenreState {
  genre: string;
  checked: boolean;
}

class ModifyGenrePage extends React.Component<{}, modifyGenreState> {
  constructor(props = {}) {
    super(props);
    this.state = {
      genre: "asdfasv",
      checked: false,
    };
  }

  onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    this.setState({ checked: false });

    alert(
      "A form was submitted: \n" + this.state.genre + "\n" + this.state.checked
    );

    event.preventDefault();
  };

  render() {
    return (
      <div>
        <h1>Modify Genre</h1>
        <form onSubmit={this.onSubmit}>
          <ToggleButton
            id="modifyGenreToggle"
            name="modifyGenreToggle"
            onLabel="Modifiable"
            offLabel="Modify"
            onIcon="pi pi-check"
            offIcon="pi pi-times"
            checked={this.state.checked}
            onChange={(e) => this.setState({ checked: !this.state.checked })}
          />

          <label htmlFor="genre">Genre</label>
          <InputText
            id="genre"
            className="p-inputtext-sm"
            name="genre"
            value={this.state.genre}
            disabled={!this.state.checked}
            onChange={(event: FormEvent<HTMLInputElement>): void => {
              this.setState({ genre: event.currentTarget.value });
            }}
          />

          <Button label="submit" type="submit" />
        </form>
      </div>
    );
  }
}

export default ModifyGenrePage;
