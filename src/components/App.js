import React from "react";

import "./App.css";
import { connect } from "react-redux";

import Main from "./Main";
import "bootstrap/dist/css/bootstrap.min.css";

const App = ({ currentUser }) => {
  return <Main currentUser={currentUser} />;
};

const mapStateToProps = (state) => ({
  currentUser: state.user.currentUser,
});

export default connect(mapStateToProps)(App);
