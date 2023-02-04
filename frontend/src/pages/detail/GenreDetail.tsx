import React, { FormEvent } from "react";
import { InputText } from "primereact/inputtext";
import { ToggleButton } from "primereact/togglebutton";
import ConfirmButton from "../../components/ConfirmButton";

interface modifyGenreState {
  genre: string;
  isModifiable: boolean;
  isConfirmationPopVisible: boolean;
}

class ModifyGenrePage extends React.Component<{}, modifyGenreState> {
  constructor(props = {}) {
    super(props);
    this.state = {
      genre: "asdfasv",
      isModifiable: false,
      isConfirmationPopVisible: false,
    };
  }

  onSubmit = (): void => {
    this.setState({ isModifiable: false });

    alert(
      "A form was submitted: \n" +
        this.state.genre +
        "\n" +
        this.state.isModifiable
    );
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
            checked={this.state.isModifiable}
            onChange={() =>
              this.setState({ isModifiable: !this.state.isModifiable })
            }
          />

          <label htmlFor="genre">Genre</label>
          <InputText
            id="genre"
            className="p-inputtext-sm"
            name="genre"
            value={this.state.genre}
            disabled={!this.state.isModifiable}
            onChange={(event: FormEvent<HTMLInputElement>): void => {
              this.setState({ genre: event.currentTarget.value });
            }}
          />

          <ConfirmButton
            isVisible={this.state.isConfirmationPopVisible}
            hideFunc={() => this.setState({ isConfirmationPopVisible: false })}
            acceptFunc={this.onSubmit}
            rejectFunc={() => {
              console.log("reject");
            }}
            buttonClickFunc={() => {
              this.setState({ isConfirmationPopVisible: true });
            }}
            disabled={!this.state.isModifiable}
            label={"Submit"}
          />

          {/* Maybe be needed in case the confrim button using the popup breaks */}
          {/* <Button disabled={!this.state.isModifiable} label="submit" type="submit" /> */}
        </form>
      </div>
    );
  }
}

export default ModifyGenrePage;
