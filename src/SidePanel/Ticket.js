import React from "react";
import firebase from "../firebase";
import { Menu, Segment, Card, Icon, Image } from "semantic-ui-react";

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

  disTick = (tickets) =>
    tickets.length > 0 &&
    tickets.map((ticket) => (
      <Segment key={ticket.id}>
        Name: {ticket.name}
        <br />
        Subject: {ticket.subject}
        <br />
        Details: {ticket.details}
      </Segment>
    ));

  isFormValid = ({ ticketName, ticketDetails, ticketSubject }) =>
    ticketName && ticketDetails && ticketSubject;

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  render() {
    const { tickets } = this.state;

    return <Segment>{this.displayTickets(tickets)}</Segment>;
  }
}

export default Ticket;
