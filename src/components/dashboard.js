import React, { Fragment } from "react";
import firebase from "../firebase";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import {
  Menu,
  Icon,
  Modal,
  Form,
  Label,
  Input,
  Button,
  Dropdown,
  TextArea,
  Header,
} from "semantic-ui-react";
import Spinner from "../Spinner";
import "./App.css";

class Dashboard extends React.Component {
  state = {
    user: this.props.currentUser,
    tickets: [],
    cat1Tickets: [],
    cat2Tickets: [],
    cat3Tickets: [],
    pendingCount: 0,
    userDetails: [],
    loading: "false",
    ticketsRef: firebase.database().ref("tickets"),
    userRef: firebase.database().ref("users"),
    value: "",
    colorValues: [
      "primary",
      "secondary",
      "success",
      "danger",
      "warning",
      "info",
      "dark",
    ],
    selectColor: "",
    postId: "",
    message: "",
    errors: [],
  };

  componentDidMount() {
    this.addListeners();
  }

  getRandomColor() {
    let colors = ["primary", "success", "danger", "warning", "info", "dark"];

    var color = colors[Math.floor(Math.random() * colors.length)];
    return color;
  }

  addListeners = () => {
    let loadedTickets = [];
    let loadedCat1Tickets = [];
    let loadedCat2Tickets = [];
    let loadedCat3Tickets = [];
    let loadedPendingCount = 0;
    this.setState({ loading: true });
    let user = this.state.user;
    this.state.ticketsRef.on("child_added", (snap) => {
      if (user.email === snap.val().createdBy.email) {
        loadedTickets.push(snap.val());
        if ("category 1" === snap.val().category) {
          loadedCat1Tickets.push(snap.val());
        }
        if ("category 2" === snap.val().category) {
          loadedCat2Tickets.push(snap.val());
        }
        if ("category 3" === snap.val().category) {
          loadedCat3Tickets.push(snap.val());
        }
        if ("pending" === snap.val().status) {
          loadedPendingCount++;
        }
      }
      this.setState({
        tickets: loadedTickets,
        cat1Tickets: loadedCat1Tickets,
        cat2Tickets: loadedCat2Tickets,
        cat3Tickets: loadedCat3Tickets,
        pendingCount: loadedPendingCount,
      });
    });

    let loadedUserDetails = [];
    this.state.userRef.on("child_added", (snap) => {
      if (user.email === snap.val().email) {
        loadedUserDetails.push(snap.val());
      }
      this.setState({ userDetails: loadedUserDetails, loading: false });
    });
  };

  displayTickets = (
    tickets,
    cat1Tickets,
    cat2Tickets,
    cat3Tickets,
    pendingCount
  ) => (
    <div
      className="col-md-auto col-lg-12"
      id="card-width-min"
      style={{ color: "white" }}
    >
      <Card
        style={{ minWidth: "18rem", margin: "10px" }}
        bg={this.getRandomColor()}
      >
        <Card.Header id="font-size-card">Ticket Analysis</Card.Header>
        <Card.Body>
          <Card.Title className="">
            <strong>Number of tickets submitted : </strong>
            {tickets.length}
          </Card.Title>
          <Card.Subtitle className="mb-2 ">
            <strong>Category 1 tickets: </strong>
            {cat1Tickets.length}
          </Card.Subtitle>
          <Card.Subtitle className="mb-2 ">
            <strong>Category 2 tickets: </strong>
            {cat2Tickets.length}
          </Card.Subtitle>
          <Card.Subtitle className="mb-2 ">
            <strong>Category 3 tickets: </strong>
            {cat3Tickets.length}
          </Card.Subtitle>
          <Card.Subtitle className="mb-2 ">
            <strong>Pending tickets: </strong>
            {pendingCount}
          </Card.Subtitle>
        </Card.Body>
        <Card.Footer>
          <small className="text-muted" id="whiteColor"></small>
        </Card.Footer>
      </Card>
    </div>
  );

  displayUserDetails = (userDetails) =>
    userDetails.map((user) => (
      <div
        key={user.id}
        className="col-md-auto col-lg-12"
        id="card-width-min"
        style={{ color: "white" }}
      >
        <Card
          style={{ minWidth: "18rem", margin: "10px" }}
          key={user.id}
          bg={this.getRandomColor()}
        >
          <Card.Header id="font-size-card">{user.name}</Card.Header>
          <Card.Body>
            <Card.Title className="">
              <strong>email: </strong>
              {user.email}
            </Card.Title>
            <Card.Subtitle className="mb-2 ">
              <strong>USN: </strong>
              {user.usn}
            </Card.Subtitle>
          </Card.Body>
          <Card.Footer>
            <small className="text-muted" id="whiteColor"></small>
          </Card.Footer>
        </Card>
      </div>
    ));

  render() {
    const {
      tickets,
      userDetails,
      cat1Tickets,
      cat2Tickets,
      cat3Tickets,
      pendingCount,
    } = this.state;

    return (
      <Container className="white-back">
        <center>
          <h2>Dashboard</h2>
        </center>
        <Header floated="right"></Header>
        <Menu.Menu style={{ paddingBottom: "2em" }}>
          <Menu.Item>
            <span>
              <Icon name="" /> Welcome
            </span>{" "}
          </Menu.Item>
        </Menu.Menu>
        <div className="row justify-content-lg-center">
          <Fragment>
            {this.displayTickets(
              tickets,
              cat1Tickets,
              cat2Tickets,
              cat3Tickets,
              pendingCount
            )}
          </Fragment>
        </div>
        <div>
          <Fragment>{this.displayUserDetails(userDetails)}</Fragment>
        </div>
      </Container>
    );
  }
}

export default Dashboard;
