import React from "react";
import firebase from "../firebase";
import {
  Menu,
  Card,
  Icon,
  Modal,
  Form,
  Input,
  Button,
} from "semantic-ui-react";
import Container from "react-bootstrap/Container";

class Ticket extends React.Component {
  state = {
    user: this.props.currentUser,
    tickets: [],
    ticketName: "",
    ticketDetails: "",
    ticketSubject: "",
    ticketsRef: firebase.database().ref("tickets"),
    modal: false,
  };

  componentDidMount() {
    this.addListeners();
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
      <Card key={ticket.id}>
        <Card.Content>
          <Card.Header>{ticket.name}</Card.Header>
          <Card.Meta>
            <span className="date">Subject: {ticket.subject}</span>
          </Card.Meta>
          <Card.Description>Description: {ticket.details}</Card.Description>
        </Card.Content>
      </Card>
    ));

  isFormValid = ({ ticketName, ticketDetails, ticketSubject }) =>
    ticketName && ticketDetails && ticketSubject;

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  render() {
    const { tickets, modal } = this.state;

    return (
      <Container>
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
        {this.displayTickets(tickets)}
      </Container>
    );
  }
}

export default Ticket;
