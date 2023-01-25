import React from "react";

interface BookListState {
  value: string;
}

class BookListPage extends React.Component<{}, BookListState> {
  constructor(props = {}) {
    super(props);
    this.state = { value: "" };
  }

  render() {
    return <h1>Dummy Book List Page!</h1>;
  }
}

export default BookListPage;
