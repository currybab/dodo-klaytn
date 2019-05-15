import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import ExplorePage from "./ExplorePage";

@inject('auth')
@observer
class RenderingPage extends Component {
  render() {
    const { page } = this.props.auth.values;
    if(page == "1") {
      return (
        <ExplorePage />
      );
    }

    if(page == "2") {
      return (
        <h1>judge</h1>
      );
    }

    return (
      <h1>explore</h1>
    );
  };
};

export default RenderingPage;