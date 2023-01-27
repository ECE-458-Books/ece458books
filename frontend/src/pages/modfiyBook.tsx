import React from "react";
import TextFieldLine from "../components/textField";
import { Button } from "primereact/button";

interface modifyBookState {
  value: string;
}

class ModifyBookPage extends React.Component<{}, modifyBookState> {
  constructor(props = {}) {
    super(props);
    this.state = { value: "" };
  }
  render() {
    return (
      <div>
        <TextFieldLine label="Title" disabled={true} placeholder="asfas" />
        <TextFieldLine label="Authors" disabled={true} placeholder="asd" />
        <TextFieldLine label="ISBN" disabled={true} placeholder="ndfgame" />
        <TextFieldLine label="Publisher" disabled={true} placeholder="sdfg" />
        <TextFieldLine
          label="Publication Year"
          disabled={true}
          placeholder="xzfg"
        />
        <TextFieldLine label="Page Count" disabled={false} placeholder="sdfg" />
        <TextFieldLine
          label="Dimensions"
          disabled={false}
          placeholder="adfuq"
        />
        <TextFieldLine
          label="Retail Price"
          disabled={false}
          placeholder="asdfas"
        />
        <TextFieldLine label="Genre" disabled={false} placeholder="asdfas" />
        <Button type="submit" label="Submit" />
      </div>
    );
  }
}

export default ModifyBookPage;
