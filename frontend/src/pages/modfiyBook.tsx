import React from "react";

interface modifyBookState {
  value: string;
}

class ModifyBookPage extends React.Component<{}, modifyBookState> {
  constructor(props = {}) {
    super(props);
    this.state = { value: "" };
  }

  render() {
    return <h1>Dummy Modify Page</h1>;
  }
}

export default ModifyBookPage;
