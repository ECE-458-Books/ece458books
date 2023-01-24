import React from 'react';

interface GenreListState {
    value: string
  }

class GenreListPage extends React.Component<{}, GenreListState> {
    constructor(props = {}) {
      super(props);
      this.state = {value: ''};
    }

    render() {
      return (
        <h1>Dummy Genre List Page</h1>
      );
    }
  }
  
  export default GenreListPage;