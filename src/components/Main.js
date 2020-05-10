/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import firebase from "../firebase";
import Ticket from "./Ticket";
import Account from "./Account";
import Chat from "./Chat";
import $ from "jquery";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { Icon } from "semantic-ui-react";

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
  componentDidMount() {
    $("#menu-toggle").click(function (e) {
      e.preventDefault();
      $("#wrapper").toggleClass("toggled");
    });
  }

  render() {
    const { currentUser } = this.props;
    const { active } = this.state;

    return (
      <div className="d-flex" id="wrapper">
        <div className="bg-light border-right" id="sidebar-wrapper">
          <div className="sidebar-heading">Grivance System </div>
          <div className="list-group list-group-flush">
            <a
              className="list-group-item list-group-item-action bg-light"
              onClick={() => this.setState({ active: "dashboard" })}
            >
              Dashboard
            </a>
            <a
              className="list-group-item list-group-item-action bg-light"
              onClick={() => this.setState({ active: "tickets" })}
            >
              Tickets
            </a>
            <a
              className="list-group-item list-group-item-action bg-light"
              onClick={() => this.setState({ active: "chat" })}
            >
              Chat
            </a>
            <a
              className="list-group-item list-group-item-action bg-light"
              onClick={() => this.setState({ active: "account" })}
            >
              Account
            </a>
          </div>
        </div>

        <div id="page-content-wrapper">
          <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
            <button className="btn" id="menu-toggle">
              <Icon name="sidebar" />
            </button>

            <button
              className="navbar-toggler"
              type="button"
              data-toggle="collapse"
              data-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div
              className="collapse navbar-collapse"
              id="navbarSupportedContent"
            >
              <ul className="navbar-nav ml-auto mt-2 mt-lg-0">
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="navbarDropdown"
                    role="button"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <img
                      src={currentUser.photoURL}
                      alt="user"
                      style={{ height: " 35px", borderRadius: "50%" }}
                    />
                  </a>
                  <div
                    className="dropdown-menu dropdown-menu-right"
                    aria-labelledby="navbarDropdown"
                  >
                    <a className="dropdown-item" href="#">
                      Signed in as <strong>{currentUser.displayName}</strong>
                    </a>
                    <div className="dropdown-divider"></div>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={this.handleSignout}
                    >
                      Logout
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </nav>

          <div className="container-fluid">
            {active === "dashboard" && <h1>Dashboard</h1>}
            {active === "account" && <Account currentUser={currentUser} />}
            {active === "tickets" && <Ticket currentUser={currentUser} />}
            {active === "chat" && <Chat />}
          </div>
        </div>
      </div>
    );
  }
}

export default Main;
