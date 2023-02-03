import React, { FormEvent } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ToggleButton } from "primereact/togglebutton";
import ConfirmButton from "../../components/ConfirmButton";

interface modifyBookState {
  title: string;
  authors: string;
  isbn: string;
  publisher: string;
  pubYear: string;
  pageCount: string;
  dimensions: string;
  retailPrice: string;
  genre: string;
  checked: boolean;
  confirmationPopup: boolean;
}

class ModifyBookPage extends React.Component<{}, modifyBookState> {
  constructor(props = {}) {
    super(props);
    this.state = {
      title: "asdfasv",
      authors: "asdfa",
      isbn: "fasasfm",
      publisher: "fasasfm",
      pubYear: "fasasfm",
      pageCount: "",
      dimensions: "",
      retailPrice: "",
      genre: "",
      checked: false,
      confirmationPopup: false,
    };
  }

  onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    this.setState({ checked: false });

    alert(
      "A form was submitted: \n" +
        this.state.title +
        "\n" +
        this.state.authors +
        "\n" +
        this.state.isbn +
        "\n" +
        this.state.publisher +
        "\n" +
        this.state.pubYear +
        "\n" +
        this.state.pageCount +
        "\n" +
        this.state.dimensions +
        "\n" +
        this.state.retailPrice +
        "\n" +
        this.state.genre +
        "\n" +
        this.state.checked
    );

    event.preventDefault();
  };

  render() {
    return (
      <div>
        <h1>Modify Book</h1>
        <form onSubmit={this.onSubmit}>
          <ToggleButton
            id="modifyBookToggle"
            name="modifyBookToggle"
            onLabel="Modifiable"
            offLabel="Modify"
            onIcon="pi pi-check"
            offIcon="pi pi-times"
            checked={this.state.checked}
            onChange={(e) => this.setState({ checked: !this.state.checked })}
          />

          <label htmlFor="title">Title</label>
          <InputText
            id="title"
            className="p-inputtext-sm"
            name="title"
            value={this.state.title}
            disabled={true}
            onChange={(event: FormEvent<HTMLInputElement>): void => {
              this.setState({ title: event.currentTarget.value });
            }}
          />

          <label htmlFor="authors">Authors</label>
          <InputText
            id="authors"
            className="p-inputtext-sm"
            name="authors"
            value={this.state.authors}
            disabled={true}
            onChange={(event: FormEvent<HTMLInputElement>): void => {
              this.setState({ authors: event.currentTarget.value });
            }}
          />

          <label htmlFor="isbn">ISBN</label>
          <InputText
            id="isbn"
            className="p-inputtext-sm"
            name="isbn"
            value={this.state.isbn}
            disabled={true}
            onChange={(event: FormEvent<HTMLInputElement>): void => {
              this.setState({ isbn: event.currentTarget.value });
            }}
          />

          <label htmlFor="publisher">Publisher</label>
          <InputText
            id="publisher"
            className="p-inputtext-sm"
            name="publisher"
            value={this.state.publisher}
            disabled={true}
            onChange={(event: FormEvent<HTMLInputElement>): void => {
              this.setState({ publisher: event.currentTarget.value });
            }}
          />

          <label htmlFor="pubYear">Publication Year</label>
          <InputText
            id="pubYear"
            className="p-inputtext-sm"
            name="pubYear"
            value={this.state.pubYear}
            disabled={true}
            onChange={(event: FormEvent<HTMLInputElement>): void => {
              this.setState({ pubYear: event.currentTarget.value });
            }}
          />

          <label htmlFor="pageCount">Page Count</label>
          <InputText
            id="pageCount"
            className="p-inputtext-sm"
            name="pageCount"
            value={this.state.pageCount}
            disabled={!this.state.checked}
            onChange={(event: FormEvent<HTMLInputElement>): void => {
              this.setState({ pageCount: event.currentTarget.value });
            }}
          />

          <label htmlFor="dimensions">Dimensions</label>
          <InputText
            id="dimensions"
            className="p-inputtext-sm"
            name="dimensions"
            value={this.state.dimensions}
            disabled={!this.state.checked}
            onChange={(event: FormEvent<HTMLInputElement>): void => {
              this.setState({ dimensions: event.currentTarget.value });
            }}
          />

          <label htmlFor="retailPrice">Retail Price</label>
          <InputText
            id="retailPrice"
            className="p-inputtext-sm"
            name="retailPrice"
            value={this.state.retailPrice}
            disabled={!this.state.checked}
            onChange={(event: FormEvent<HTMLInputElement>): void => {
              this.setState({ retailPrice: event.currentTarget.value });
            }}
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

          <ConfirmButton
            confirmationPopup={this.state.confirmationPopup}
            hideFunc={() => this.setState({ confirmationPopup: false })}
            acceptFunc={this.onSubmit}
            rejectFunc={() => {
              console.log("reject");
            }}
            buttonClickFunc={() => {
              this.setState({ confirmationPopup: true });
            }}
            disabled={!this.state.checked}
            label={"Submit"}
          />
          {/* <Button disabled={!this.state.checked} label="submit" type="submit" /> */}
        </form>
      </div>
    );
  }
}

export default ModifyBookPage;
