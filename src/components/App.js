import React from "react";
import { Grid } from "semantic-ui-react";
import "./App.css";
import { connect } from "react-redux";

import SidePanel from "../SidePanel/SidePanel";

const App = ({ currentUser }) => (
  <Grid columns="equal" className="app" style={{ background: "#eee" }}>
    <SidePanel currentUser={currentUser} />
  </Grid>
);

const mapStateToProps = (state) => ({
  currentUser: state.user.currentUser,
});

export default connect(mapStateToProps)(App);
