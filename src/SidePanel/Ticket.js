import React from "react";
import firebase from "../firebase";
import { Menu, Icon, Modal, Form, Input, Button } from "semantic-ui-react";

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
      <Menu.Item
        key={ticket.id}
        onClick={() => console.log(ticket)}
        name={ticket.name}
        style={{ opacity: 0.7 }}
      >
        # {ticket.name}
        <br />
        Subject:{ticket.subject}
        <br />
        Details:{ticket.details}
      </Menu.Item>
    ));

  isFormValid = ({ ticketName, ticketDetails, ticketSubject }) =>
    ticketName && ticketDetails && ticketSubject;

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  render() {
    const { tickets, modal } = this.state;

    return (
      <React.Fragment>
        <Menu.Menu style={{ paddingBottom: "2em" }}>
          <Menu.Item>
            <span>
              <Icon name="exchange" /> TICKETS
            </span>{" "}
            ({tickets.length}) <Icon name="add" onClick={this.openModal} />
          </Menu.Item>
          {this.displayTickets(tickets)}
        </Menu.Menu>

        {/* Add Channel Modal */}
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Add a Ticket</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input
                  fluid
                  label="Name of Ticket"
                  name="ticketName"
                  onChange={this.handleChange}
                />
              </Form.Field>
              <Form.Field>
                <Input
                  fluid
                  label="Subject of Ticket"
                  name="ticketSubject"
                  onChange={this.handleChange}
                />
              </Form.Field>

              <Form.Field>
                <Input
                  fluid
                  label="About the Ticket"
                  name="ticketDetails"
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form>
          </Modal.Content>

          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSubmit}>
              <Icon name="checkmark" /> Add
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    );
  }
}

export default Ticket;
