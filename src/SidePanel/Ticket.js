import React, { Fragment } from "react";
import firebase from "../firebase";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Accordion from "react-bootstrap/Accordion";
import FileLink from "./FileLink";
import {
  Menu,
  Icon,
  Modal,
  Form,
  Input,
  Button,
  Dropdown,
  TextArea,
} from "semantic-ui-react";
import Spinner from "../Spinner";
import FileModal from "./FileModal";
import ProgressBar from "./ProgressBar";

const options = [
  { key: 1, text: "Category 1", value: "category 1" },
  { key: 2, text: "Category 2", value: "category 2" },
  { key: 3, text: "Category 3", value: "category 3" },
];

class Ticket extends React.Component {
  state = {
    user: this.props.currentUser,
    tickets: [],
    ticketName: "",
    ticketDetails: "",
    ticketSubject: "",
    status: "pending",
    loading: "false",
    ticketsRef: firebase.database().ref("tickets"),
    storageRef: firebase.storage().ref(),
    imagesRef: firebase.database().ref("images"),
    modalT: false,
    modal: false,
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
    uploadTask: null,
    uploadState: "",
    percentUploaded: 0,
    message: "",
    errors: [],
  };

  componentDidMount() {
    this.addListeners();
    this.getRandomColor();
  }

  createMessage = (fileUrl = null) => {
    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: this.state.user.uid,
        name: this.state.user.displayName,
        avatar: this.state.user.photoURL,
      },
    };
    if (fileUrl !== null) {
      message["image"] = fileUrl;
    }
    return message;
  };

  sendMessage = () => {
    const { imagesRef } = this.state.imagesRef;
    const { message, postId } = this.state;

    if (message) {
      this.setState({ loading: true });
      imagesRef
        .child(postId)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({ loading: false, message: "", errors: [] });
        })
        .catch((err) => {
          console.error(err);
          this.setState({
            loading: false,
            errors: this.state.errors.concat(err),
          });
        });
    } else {
      this.setState({
        errors: this.state.errors.concat({ message: "Add a message" }),
      });
    }
  };

  getPath = () => {
    return `bat/soup/${this.state.postId}`;
  };

  uploadFile = (file, metadata) => {
    const pathToUpload = this.state.postId;
    const ref = this.state.ticketsRef;
    const filePath = `${this.getPath()}/${uuidv4()}.jpg`;

    this.setState(
      {
        uploadState: "uploading",
        uploadTask: this.state.storageRef.child(filePath).put(file, metadata),
      },
      () => {
        this.state.uploadTask.on(
          "state_changed",
          (snap) => {
            const percentUploaded = Math.round(
              (snap.bytesTransferred / snap.totalBytes) * 100
            );
            this.setState({ percentUploaded });
          },
          (err) => {
            console.error(err);
            this.setState({
              errors: this.state.errors.concat(err),
              uploadState: "error",
              uploadTask: null,
            });
          },
          () => {
            this.state.uploadTask.snapshot.ref
              .getDownloadURL()
              .then((downloadUrl) => {
                this.sendFileMessage(downloadUrl, ref, pathToUpload);
              })
              .catch((err) => {
                console.error(err);
                this.setState({
                  errors: this.state.errors.concat(err),
                  uploadState: "error",
                  uploadTask: null,
                });
              });
          }
        );
      }
    );
  };

  sendFileMessage = (fileUrl, ref, pathToUpload) => {
    ref
      .child(this.state.postId)
      .child("images")
      .push()
      .set(this.createMessage(fileUrl))
      .then(() => {
        this.setState({ uploadState: "done" });
      })
      .catch((err) => {
        console.error(err);
        this.setState({
          errors: this.state.errors.concat(err),
        });
      });
  };

  getRandomColor() {
    let colors = ["primary", "success", "danger", "warning", "info", "dark"];

    var color = colors[Math.floor(Math.random() * colors.length)];
    return color;
  }

  addListeners = () => {
    let loadedTickets = [];
    this.setState({ loading: true });
    let user = this.state.user;
    this.state.ticketsRef.on("child_added", (snap) => {
      if (user.email === snap.val().createdBy.email) {
        loadedTickets.push(snap.val());
      }
      this.setState({ tickets: loadedTickets, loading: false });
      console.log(loadedTickets);
    });
  };

  addTicket = () => {
    const {
      ticketsRef,
      ticketName,
      ticketDetails,
      ticketSubject,
      value,
      status,
      user,
    } = this.state;

    const key = ticketsRef.push().key;

    const newTicket = {
      id: key,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      name: ticketName,
      status: status,
      details: ticketDetails,
      subject: ticketSubject,
      category: value,
      images: { t: "" },
      createdBy: {
        name: user.displayName,
        email: user.email,
      },
    };

    ticketsRef
      .child(key)
      .update(newTicket)
      .then(() => {
        this.setState({
          ticketName: "",
          ticketDetails: "",
          ticketSubject: "",
          value: "",
        });
        this.closeModalT();
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

  handleChangeDrop = (e, { value }) => this.setState({ value });

  displayTickets = (tickets) =>
    tickets.length > 0 &&
    tickets.map((ticket) => (
      <div
        key={ticket.id}
        className="col-md-auto col-lg-12"
        id="card-width-min"
        style={{ color: "white" }}
      >
        <Card
          style={{ minWidth: "18rem", margin: "10px" }}
          key={ticket.id}
          bg={this.getRandomColor()}
        >
          <Card.Body>
            <Card.Title id="font-size-card">{ticket.name}</Card.Title>
            <Card.Subtitle className="mb-2 ">
              <strong>Subject: </strong>
              {ticket.subject}
            </Card.Subtitle>
            <Card.Subtitle className="mb-2 ">
              <strong>Category: </strong>
              {ticket.category}
            </Card.Subtitle>
            <Card.Subtitle className="mb-2 ">
              <strong>Status: </strong>
              {ticket.status}
            </Card.Subtitle>
            <Card.Text>{ticket.details}</Card.Text>
            <Button
              variant="outline-light"
              onClick={() => this.setState({ postId: ticket.id, modal: true })}
            >
              Upload file
            </Button>

            {Object.entries(ticket.images).map(([key, image]) => {
              const imageKey = `image-${key}`;
              return <FileLink file={image.image} key={imageKey} />;
            })}

            <FileModal
              modal={this.state.modal}
              closeModal={this.closeModal}
              uploadFile={this.uploadFile}
            />
            <ProgressBar
              uploadState={this.state.uploadState}
              percentUploaded={this.state.percentUploaded}
            />
          </Card.Body>
          <Card.Footer>
            <small className="text-muted" id="whiteColor">
              Posted {moment(ticket.timestamp).fromNow()}
            </small>
          </Card.Footer>
        </Card>
      </div>
    ));

  isFormValid = ({ ticketName, ticketDetails, ticketSubject, value }) =>
    ticketName && ticketDetails && ticketSubject && value;

  openModalT = () => this.setState({ modalT: true });

  closeModalT = () => this.setState({ modalT: false });

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  render() {
    const { tickets, modalT, value, loading } = this.state;

    return (
      <Container className="white-back">
        <h2>Tickets</h2>
        <Menu.Menu style={{ paddingBottom: "2em" }}>
          <Menu.Item>
            <span>
              <Icon name="exchange" /> Create a Ticket
            </span>{" "}
            <Icon name="add" onClick={this.openModalT} />
          </Menu.Item>
        </Menu.Menu>
        <Modal basic open={modalT} onClose={this.closeModalT}>
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
                <Dropdown
                  onChange={this.handleChangeDrop}
                  options={options}
                  placeholder="Select a category"
                  selection
                  value={value}
                />
              </Form.Field>

              <Form.Field>
                <TextArea
                  name="ticketDetails"
                  placeholder="Tell us more"
                  style={{ minHeight: 100, maxHeight: 320 }}
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form>
          </Modal.Content>

          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSubmit}>
              <Icon name="checkmark" /> Submit
            </Button>
            <Button color="red" inverted onClick={this.closeModalT}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
        <div className="row justify-content-lg-center">
          {loading ? (
            <Spinner />
          ) : (
            <Fragment>{this.displayTickets(tickets)}</Fragment>
          )}
        </div>
      </Container>
    );
  }
}

export default Ticket;
