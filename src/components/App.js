import React from "react";

import "./App.css";
import { connect } from "react-redux";

import Main from "./Main";
import "bootstrap/dist/css/bootstrap.min.css";

const App = ({ currentUser, userDetails }) => {
  return <Main currentUser={currentUser} userDetails={userDetails} />;
};

const mapStateToProps = (state) => ({
  currentUser: state.user.currentUser,
  userDetails: state.tickets.userDetails,
});

export default connect(mapStateToProps)(App);
