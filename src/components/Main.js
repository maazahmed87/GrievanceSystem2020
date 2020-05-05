import React, { Fragment } from "react";
import firebase from "../firebase";
import Ticket from "../SidePanel/Ticket";

import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import { Container } from "semantic-ui-react";

class Main extends React.Component {
  state = {
    active: "tickets",
  };
  handleSignout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => console.log("signed out!"));
  };

  render() {
    const { currentUser } = this.props;
    const { active } = this.state;

    return (
      <Fragment>
        <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
          <Navbar.Brand href="/">Grievance System</Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav>
              <NavDropdown
                title={currentUser.displayName}
                id="collasible-nav-dropdown"
              >
                <NavDropdown.Item href="#action/3.1">
                  Signed in as{" "}
                  <strong style={{ textTransform: "capitalize" }}>
                    {currentUser.displayName}
                  </strong>
                </NavDropdown.Item>
                <NavDropdown.Item>Change Avatar</NavDropdown.Item>
                <NavDropdown.Item>Something</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  href="#action/3.4"
                  onClick={this.handleSignout}
                >
                  Sign out
                </NavDropdown.Item>
              </NavDropdown>
              <Nav.Link onClick={() => this.setState({ active: "account" })}>
                Account
              </Nav.Link>
              <Nav.Link onClick={() => this.setState({ active: "tickets" })}>
                Tickets
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Container fluid>
          {active === "tickets" && <Ticket currentUser={currentUser} />}
        </Container>
      </Fragment>
    );
  }
}

export default Main;
