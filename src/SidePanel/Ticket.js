import React from "react";
import firebase from "../firebase";
import moment from "moment";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import { Menu, Icon, Modal, Form, Input, Button } from "semantic-ui-react";
import { CardColumns } from "reactstrap";

class Ticket extends React.Component {
  state = {
    user: this.props.currentUser,
    tickets: [],
    ticketName: "",
    ticketDetails: "",
    ticketSubject: "",
    ticketsRef: firebase.database().ref("tickets"),
    modal: false,
    colorValues: [
      "primary",
      "secondary",
      "success",
      "danger",
      "warning",
      "info",
      "light",
    ],
    selectColor: "",
  };

  componentDidMount() {
    this.addListeners();
    this.getRandomColor();
  }

  getRandomColor() {
    let colors = [
      "primary",
      "secondary",
      "success",
      "danger",
      "warning",
      "info",
      "dark",
    ];

    var color = colors[Math.floor(Math.random() * colors.length)];
    return color;
  }

  addListeners = () => {
    let loadedTickets = [];
    let user = this.state.user;
    this.state.ticketsRef.on("child_added", (snap) => {
      if (user.email === snap.val().createdBy.email) {
        loadedTickets.push(snap.val());
      }
      this.setState({ tickets: loadedTickets });
    });
  };

  addTicket = () => {
    const {
      ticketsRef,
      ticketName,
      ticketDetails,
      ticketSubject,
      user,
    } = this.state;

    const key = ticketsRef.push().key;

    const newTicket = {
      id: key,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      name: ticketName,
      details: ticketDetails,
      subject: ticketSubject,
      createdBy: {
        name: user.displayName,
        email: user.email,
      },
    };

    ticketsRef
      .child(key)
      .update(newTicket)
      .then(() => {
        this.setState({ ticketName: "", ticketDetails: "", ticketSubject: "" });
        this.closeModal();
        console.log("ticket added");
      })
      .catch((err) => {
        console.error(err);
      });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    if (this.isFormValid(this.state)) {
      this.addTicket();
    }
  };

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  displayTickets = (tickets) =>
    tickets.length > 0 &&
    tickets.map((ticket) => (
      <Card
        style={{ width: "18rem", margin: "10px" }}
        key={ticket.id}
        border={this.getRandomColor()}
      >
        <Card.Body>
          <Card.Title>{ticket.name}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            {ticket.subject}
          </Card.Subtitle>
          <Card.Text>{ticket.details}</Card.Text>
        </Card.Body>
        <Card.Footer>{moment(ticket.timestamp).fromNow()}</Card.Footer>
      </Card>
    ));

  isFormValid = ({ ticketName, ticketDetails, ticketSubject }) =>
    ticketName && ticketDetails && ticketSubject;

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  render() {
    const { tickets, modal } = this.state;

    return (
      <Container className="white-back">
        <h2>Tickets</h2>
        <Menu.Menu style={{ paddingBottom: "2em" }}>
          <Menu.Item>
            <span>
              <Icon name="exchange" /> Create a Ticket
            </span>{" "}
            <Icon name="add" onClick={this.openModal} />
          </Menu.Item>
        </Menu.Menu>
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Create Ticket</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input
                  fluid
                  label="Ticket Name"
                  name="ticketName"
                  onChange={this.handleChange}
                />
              </Form.Field>

              <Form.Field>
                <Input
                  fluid
                  label="Ticket Subject"
                  name="ticketSubject"
                  onChange={this.handleChange}
                />
              </Form.Field>

              <Form.Field>
                <Input
                  fluid
                  label="Ticket Description"
                  name="ticketDetails"
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form>
          </Modal.Content>

          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSubmit}>
              <Icon name="checkmark" /> Submit
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
        <CardColumns>{this.displayTickets(tickets)}</CardColumns>
      </Container>
    );
  }
}

export default Ticket;
