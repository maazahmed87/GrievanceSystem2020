import React, { Fragment } from "react";
import firebase from "../firebase";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

import FileLink from "./FileLink";
import {
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
import FileModal from "./FileModal";
import ProgressBar from "./ProgressBar";
import ItemList from "./ItemList";
import "./App.css";

const options = [
  { key: 1, text: "Category 1", value: "category 1" },
  { key: 2, text: "Category 2", value: "category 2" },
  { key: 3, text: "Category 3", value: "category 3" },
];

class Ticket extends React.Component {
  state = {
    user: this.props.currentUser,
    userType: "",
    domain: "",
    tickets: [],
    ticketName: "",
    ticketDetails: "",
    ticketSubject: "",
    status: "pending",
    loading: "false",
    ticketsRef: firebase.database().ref("tickets"),
    usersRef: firebase.database().ref("users"),
    storageRef: firebase.storage().ref(),
    imagesRef: firebase.database().ref("images"),
    itemsRef: firebase.database().ref("items"),
    modalT: false,
    modalD: false,
    modal: false,
    modelI: false,
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
    deleteId: "",
    searchTerm: "",
    searchLoading: false,
    searchResults: [],
    itemName: "",
    itemCost: "",
  };

  componentDidMount() {
    this.addListeners();
    let user = this.state.user.displayName;
    let title = "Tickets | " + user;
    document.title = title;
  }
  componentWillMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    if (this.state.uploadTask !== null) {
      this.state.uploadTask.cancel();
      this.setState({ uploadTask: null });
    }
  }
  createMessage = (fileUrl = null, name) => {
    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: this.state.user.uid,
        name: this.state.user.displayName,
        avatar: this.state.user.photoURL,
      },
    };
    if (fileUrl !== null) {
      message["url"] = fileUrl;
      message["filename"] = name;
    }
    return message;
  };

  handleSearchChange = (event) => {
    this.setState(
      {
        searchTerm: event.target.value,
        searchLoading: true,
      },
      () => this.handleSearchTickets()
    );
  };

  handleSearchTickets = () => {
    const filterTickets = [...this.state.tickets];
    const regex = new RegExp(this.state.searchTerm, "gi");
    const searchResults = filterTickets.reduce((acc, ticket) => {
      if (
        ticket.createdBy.email.match(regex) ||
        ticket.status.match(regex) ||
        ticket.category.match(regex) ||
        ticket.name.match(regex) ||
        ticket.createdBy.name.match(regex) ||
        ticket.subject.match(regex) ||
        ticket.details.match(regex)
      ) {
        acc.push(ticket);
      }
      return acc;
    }, []);
    this.setState({ searchResults });
    setTimeout(() => this.setState({ searchLoading: false }), 1000);
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
                this.sendFileMessage(downloadUrl, ref, pathToUpload, file);
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

  sendFileMessage = (fileUrl, ref, pathToUpload, file) => {
    ref
      .child(this.state.postId)
      .child("images")
      .push()
      .set(this.createMessage(fileUrl, file.name))
      .then(() => {
        this.setState({ uploadState: "done" });
        this.addListeners();
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
    this.setState({ loading: true });
    let user = this.state.user;
    this.state.usersRef.on("child_added", (snap) => {
      if (user.email === snap.val().email) {
        if (snap.val().type === "admin") {
          this.setState({ userType: "admin", domain: snap.val().domain });
          console.log(snap.val().type);
        } else {
          this.setState({ userType: "user" });
          console.log(snap.val().type);
        }
      }
    });
    this.getTickets();
  };

  getTickets = () => {
    let loadedTickets = [];
    let user = this.state.user;
    this.state.ticketsRef.on("child_added", (snap) => {
      if (
        this.state.domain === snap.val().category &&
        this.state.userType === "admin"
      ) {
        loadedTickets.push(snap.val());
        console.log(snap.val().category);
      } else if (
        this.state.userType === "user" &&
        user.email === snap.val().createdBy.email
      ) {
        loadedTickets.push(snap.val());
        console.log(snap.val().category);
      }
      console.log(loadedTickets);
      this.setState({ tickets: loadedTickets, loading: false });
      this.getRandomColor();
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
      items: { j: "" },
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

  addItem = () => {
    const { itemName, itemCost, postId, ticketsRef } = this.state;
    const newItem = {
      name: itemName,
      cost: itemCost,
    };

    ticketsRef
      .child(postId)
      .child("items")
      .push()
      .set(newItem)
      .then(() => {
        this.setState({
          itemName: "",
          itemCost: "",
        });
        this.closeModalI();
        console.log("item added");
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

  handleItem = (event) => {
    event.preventDefault();
    if (this.isItemValid(this.state)) {
      this.addItem();
    }
    this.addListeners();
  };

  handleDelete = () => {
    let ticket_id = this.state.deleteId;
    let ref = this.state.ticketsRef;
    ref.child(ticket_id).remove();
    this.closeModalD();
    this.addListeners();
  };

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleChangeDrop = (e, { value }) => this.setState({ value });

  displayTickets = (tickets, total = 0, oldtotal = 0) =>
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
          <Card.Header id="font-size-card">
            {ticket.name}
            <button
              type="button"
              className="btn btn-secondary"
              data-toggle="tooltip"
              data-placement="top"
              title="Delete ticket"
              onClick={() => {
                this.setState({ modalD: true, deleteId: ticket.id });
              }}
              style={{
                float: "right",
                outline: "none",
                background: "transparent",
                border: "none",
              }}
            >
              <Icon name="trash" />
            </button>
          </Card.Header>
          <Card.Body>
            <Card.Title id="font-size-sub">
              <strong>Subject: </strong>
              {ticket.subject}
            </Card.Title>
            <Card.Title id="font-size-sub ">
              <strong>Category: </strong>
              {ticket.category}
            </Card.Title>

            <Card.Subtitle className="mb-2">
              <strong style={{ fontSize: "18px" }}>Status: </strong>
              <Label size="small" color="black" basic>
                <span style={{ textTransform: "capitalize" }}>
                  {ticket.status}
                </span>
              </Label>
            </Card.Subtitle>
            <Card.Text
              style={{
                fontSize: "14px",
                color: "black",
                background: "white",
                padding: "8px",
                borderRadius: "4px",
              }}
            >
              {ticket.details}
            </Card.Text>

            {ticket.category === "category 1" && (
              <div style={{ paddingBottom: "10px" }}>
                <h4>Items</h4>
                <Card.Text>
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Cost</th>
                      </tr>
                    </thead>
                    <tbody style={{ color: "white!important" }}>
                      {Object.entries(ticket.items).map(([key, item]) => {
                        const itemKey = `item-${key}`;
                        if (itemKey !== "item-j") {
                          let cost = parseInt(`${item.cost}`);
                          total = total + cost;
                        } else {
                          total = total - oldtotal;
                          return null;
                        }
                        return (
                          <ItemList
                            name={item.name}
                            cost={item.cost}
                            key={itemKey}
                            ikey={itemKey}
                          />
                        );
                      })}
                      <tr>
                        <td>Total</td>
                        <td>{(oldtotal = total)}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Text>
                {this.state.userType === "admin" && (
                  <Button
                    compact
                    inverted
                    variant="outline-light"
                    color="white"
                    onClick={() =>
                      this.setState({ postId: ticket.id, modalI: true })
                    }
                  >
                    Add item
                  </Button>
                )}
              </div>
            )}

            <Button
              compact
              inverted
              variant="outline-light"
              color="white"
              onClick={() => this.setState({ postId: ticket.id, modal: true })}
            >
              Upload file
            </Button>
            <Card.Text>
              {Object.entries(ticket.images).map(([key, image]) => {
                const imageKey = `image-${key}`;
                return (
                  <FileLink
                    fileRef={image.url}
                    fileName={image.filename}
                    key={imageKey}
                    ikey={imageKey}
                  />
                );
              })}
            </Card.Text>

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

  isItemValid = ({ itemName, itemCost }) => itemName && itemCost;

  openModalT = () => this.setState({ modalT: true });

  closeModalT = () => this.setState({ modalT: false });

  openModalD = () => this.setState({ modalD: true });

  closeModalD = () => this.setState({ modalD: false });

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  openModalI = () => this.setState({ modalI: true });

  closeModalI = () => this.setState({ modalI: false });

  render() {
    const {
      tickets,
      modalT,
      modalD,
      modalI,
      value,
      loading,
      searchLoading,
      searchResults,
      searchTerm,
    } = this.state;

    return (
      <Container className="white-back">
        <center>
          <h2 style={{ color: "black", margin: "10px 0px" }}>Tickets</h2>
        </center>
        <Header floated="right">
          <Input
            loading={searchLoading}
            onChange={this.handleSearchChange}
            size="mini"
            icon="search"
            name="searchTerm"
            placeholder="Search Tickets"
          />
        </Header>
        <Button primary onClick={this.openModalT}>
          Create a Ticket &nbsp;&nbsp;
          <Icon name="write" />
        </Button>
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
                  style={{ minHeight: 200, maxHeight: 320 }}
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

        <Modal basic open={modalI} onClose={this.closeModalI}>
          <Modal.Header>Add Item</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleItem}>
              <Form.Field>
                <Input
                  fluid
                  label="Item Name"
                  name="itemName"
                  onChange={this.handleChange}
                />
              </Form.Field>

              <Form.Field>
                <Input
                  fluid
                  label="Item Cost"
                  name="itemCost"
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form>
          </Modal.Content>

          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleItem}>
              <Icon name="checkmark" /> Add
            </Button>
            <Button color="red" inverted onClick={this.closeModalI}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>

        <Modal basic open={modalD} onClose={this.closeModalD}>
          <Modal.Header>Delete Ticket? </Modal.Header>

          <Modal.Actions>
            <Button color="red" inverted onClick={this.handleDelete}>
              <Icon name="trash" /> Delete
            </Button>
            <Button color="green" inverted onClick={this.closeModalD}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>

        <div className="row justify-content-lg-center">
          {loading ? (
            <Spinner />
          ) : (
            <Fragment>
              {searchTerm
                ? this.displayTickets(searchResults)
                : this.displayTickets(tickets)}
            </Fragment>
          )}
        </div>
      </Container>
    );
  }
}

export default Ticket;
