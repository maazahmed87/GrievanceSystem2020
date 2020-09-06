import React, { Fragment } from "react";
import firebase from "../firebase";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import { setTickets, setUserDetails } from "../actions/index.js";
import { connect } from "react-redux";
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
  Divider,
  Segment,
  Table,
  Header,
  Comment,
  Accordion,
  Popup,
  List,
} from "semantic-ui-react";
import Spinner from "../Spinner";
import FileModal from "./FileModal";
import ProgressBar from "./ProgressBar";
import ItemList from "./ItemList";
import CommentList from "./CommentList";
import "./App.css";

const options = [
  { key: 1, text: "Maintenance", value: "maintenance" },
  { key: 2, text: "Electrical and Plumbing", value: "electrical_plumbing" },
  { key: 3, text: "Other grievances", value: "other" },
];

class Ticket extends React.Component {
  state = {
    user: this.props.currentUser,
    userDetails: "",
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
    modalC: false,
    modalO: false,
    modalF: false,
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
    flagId: "",
    searchTerm: this.props.term,
    searchLoading: false,
    searchResults: [],
    itemName: "",
    itemCost: "",
    itemId: "",
    activeIndex: 0,
    comment: "",
  };

  componentDidMount() {
    this.addListeners();
    let user = this.state.user.displayName;
    let title = "Tickets | " + user;
    document.title = title;
    this.handleSearchTermChange(this.state.searchTerm);
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

  componentWillReceiveProps(props) {
    this.setState({
      userDetails: props.userDetails,
      userType: props.userDetails.type,
      faculty: props.userDetails.faculty,
      domain: props.userDetails.domain,
    });
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

  handleSearchTermChange = (term) => {
    this.setState(
      {
        searchTerm: term,
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
    let colors = ["primary", "success", "danger", "warning", "info"];
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
        if (snap.val().faculty) {
          this.setState({ faculty: true });
          console.log(snap.val().faculty);
        } else {
          this.setState({ faculty: false });
          console.log(snap.val().faculty);
        }
        this.props.setUserDetails(snap.val());
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
      } else if (
        this.state.userType === "user" &&
        user.email === snap.val().createdBy.email
      ) {
        loadedTickets.push(snap.val());
      }

      this.setState({ tickets: loadedTickets, loading: false });
      this.props.setTickets(loadedTickets);
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
      comments: { p: "" },
      flag: "false",
      createdBy: {
        name: user.displayName,
        email: user.email,
        faculty: this.state.faculty,
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

  deleteItem = (itemId, ticketId) => {
    let ref = this.state.ticketsRef;
    ref.child(ticketId).child("items").child(itemId).remove();
    this.addListeners();
  };
  deleteComment = (commentId, ticketId) => {
    let ref = this.state.ticketsRef;
    ref.child(ticketId).child("comments").child(commentId).remove();
    this.addListeners();
  };

  addComment = () => {
    const { comment, postId, ticketsRef, user } = this.state;
    const newComment = {
      comment: comment,
      name: user.displayName,
      email: user.email,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      avatar: user.photoURL,
    };

    ticketsRef
      .child(postId)
      .child("comments")
      .push()
      .set(newComment)
      .then(() => {
        this.setState({
          comment: "",
        });
        this.closeModalComm();
        console.log("comment added");
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

  handleAccordion = (e, titleProps) => {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;
    this.setState({ activeIndex: newIndex });
  };

  handleComment = (event) => {
    event.preventDefault();
    if (this.isCommentValid(this.state)) {
      this.addComment();
      this.setState({ comment: "" });
    }
    document.getElementsByName("comment").value = "";
    this.addListeners();
    this.setState({ comment: "" });
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

  handleFlag = (id, flag) => {
    let ref = this.state.ticketsRef;
    if (flag === "true") {
      ref.child(id).update({ flag: "false" });
    } else {
      ref.child(id).update({ flag: "true" });
    }
    this.addListeners();
  };

  handleCloseTicket = () => {
    let ticket_id = this.state.postId;
    let ref = this.state.ticketsRef;
    ref.child(ticket_id).update({ status: "closed" });
    this.closeModalC();
    this.addListeners();
  };

  handleOpenTicket = () => {
    let ticket_id = this.state.postId;
    let ref = this.state.ticketsRef;
    ref.child(ticket_id).update({ status: "pending" });
    this.closeModalO();
    this.addListeners();
  };

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleChangeDrop = (e, { value }) => this.setState({ value });

  displayTickets = (tickets, total = 0, oldtotal = 0) =>
    tickets.length > 0 &&
    tickets.map((ticket, index = 1) => (
      <div
        key={ticket.id}
        className="col-md-auto col-lg-12"
        id="card-width-min"
        style={{ color: "black" }}
      >
        <Card
          style={{ minWidth: "18rem", margin: "10px" }}
          key={ticket.id}
          border={ticket.status === "closed" ? "success" : "danger"}
          fluid
        >
          <Segment raised>
            <Accordion.Title
              active={this.state.activeIndex === index}
              index={index}
              id="font-size-card"
              style={{
                textTransform: "capitalize",
                paddingBottom: "0px",
              }}
              onClick={this.handleAccordion}
            >
              <Card.Title as="h3">
                <Label
                  style={{ textTransform: "capitalize" }}
                  as="a"
                  color={ticket.status === "closed" ? "green" : "red"}
                  ribbon
                >
                  {ticket.status}
                </Label>
                <Icon name="dropdown" />
                <strong>{ticket.name}</strong>
                {this.state.user.email === ticket.createdBy.email && (
                  <Popup
                    content="Delete complaint"
                    inverted
                    size="tiny"
                    position="top right"
                    trigger={
                      <Button
                        icon="trash"
                        onClick={() => {
                          this.setState({ modalD: true, deleteId: ticket.id });
                        }}
                        style={{
                          float: "right",
                          outline: "none!important",
                          background: "transparent",
                          border: "none",
                        }}
                      />
                    }
                  />
                )}
                {this.state.userType === "admin" && (
                  <Popup
                    content={
                      ticket.flag === "true"
                        ? "Unflag complaint"
                        : "Flag complaint"
                    }
                    inverted
                    size="tiny"
                    position="top right"
                    trigger={
                      <Icon
                        name="flag"
                        color={ticket.flag === "true" ? "yellow" : "black"}
                        onClick={() => {
                          this.handleFlag(ticket.id, ticket.flag);
                        }}
                        style={{
                          float: "right",
                          outline: "none!important",
                          border: "none",
                        }}
                      />
                    }
                  />
                )}

                {this.state.activeIndex !== index && (
                  <span style={{ float: "right", marginRight: "20px" }}>
                    <strong>ID: </strong>
                    <span style={{ fontWeight: 500 }}>{ticket.timestamp}</span>
                    {this.state.userType === "admin" && (
                      <strong>
                        {" "}
                        | {ticket.createdBy.faculty ? "Faculty" : "Student"}
                      </strong>
                    )}
                  </span>
                )}
              </Card.Title>
            </Accordion.Title>
            <Accordion.Content active={this.state.activeIndex === index}>
              <Card.Header>
                {this.state.userType === "admin" && (
                  <Card.Title>
                    <strong>By: </strong>
                    {ticket.createdBy.email}
                    <br />
                  </Card.Title>
                )}
                <Card.Title>
                  <strong>Id: </strong>
                  {ticket.timestamp}
                </Card.Title>
                <Card.Title>
                  <strong>Subject: </strong>
                  {ticket.subject}
                </Card.Title>

                <Card.Title
                  id="font-size-sub "
                  style={{ textTransform: "capitalize" }}
                >
                  <strong>Category: </strong>
                  {ticket.category}
                </Card.Title>

                <Card.Subtitle className="mb-2">
                  <strong style={{ fontSize: "18px" }}>Status: </strong>
                  <Label
                    size="small"
                    color={ticket.status !== "closed" ? "red" : "green"}
                  >
                    <span style={{ textTransform: "capitalize" }}>
                      {ticket.status}
                    </span>
                  </Label>
                </Card.Subtitle>

                {ticket.status === "closed" &&
                  this.state.userType === "admin" && (
                    <Button
                      compact
                      content="Open complaint"
                      labelPosition="left"
                      size="small"
                      icon="unlock"
                      primary
                      onClick={() =>
                        this.setState({ postId: ticket.id, modalO: true })
                      }
                    />
                  )}

                {ticket.status === "pending" &&
                  this.state.userType === "admin" && (
                    <Button
                      compact
                      content="Close complaint"
                      labelPosition="left"
                      size="small"
                      icon="lock"
                      primary
                      onClick={() =>
                        this.setState({ postId: ticket.id, modalC: true })
                      }
                    />
                  )}

                <Divider horizontal />

                <Card.Body
                  style={{
                    fontSize: "16px",
                    background: "white",
                    lineHeight: "1.3em",
                    padding: "12px",
                    borderRadius: "6px",
                    fontWeight: "400",
                    fontFamily: "Lato",
                  }}
                >
                  {ticket.details}
                </Card.Body>
                <Divider hidden />
                {ticket.category === "category 1" && (
                  <div style={{ paddingBottom: "10px" }}>
                    <Header as="h3">Items</Header>
                    <Divider />
                    {Object.keys(ticket.items).length === 1 && (
                      <Fragment>
                        <span>No items added</span>
                        <Divider hidden />
                      </Fragment>
                    )}
                    <Card.Text>
                      {Object.keys(ticket.items).length > 1 && (
                        <Table celled compact color="olive">
                          <Table.Header>
                            <Table.Row>
                              <Table.HeaderCell>Item</Table.HeaderCell>
                              <Table.HeaderCell>Cost</Table.HeaderCell>
                            </Table.Row>
                          </Table.Header>
                          <Table.Body>
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
                                  itemCallBack={this.deleteItem}
                                  name={item.name}
                                  cost={item.cost}
                                  ckey={ticket.id}
                                  tkey={key}
                                  ikey={itemKey}
                                  user={this.state.userType}
                                />
                              );
                            })}
                          </Table.Body>
                          <Table.Footer>
                            <Table.Row>
                              <Table.HeaderCell>
                                <strong>Total</strong>
                              </Table.HeaderCell>
                              <Table.HeaderCell>
                                <strong>{(oldtotal = total)}</strong>
                              </Table.HeaderCell>
                            </Table.Row>
                          </Table.Footer>
                        </Table>
                      )}
                      {this.state.userType === "admin" && (
                        <Button
                          compact
                          content="Add Item"
                          labelPosition="left"
                          size="small"
                          icon="add"
                          primary
                          onClick={() =>
                            this.setState({ postId: ticket.id, modalI: true })
                          }
                        />
                      )}
                    </Card.Text>
                  </div>
                )}

                <Header as="h3">Comments</Header>
                <Divider />
                <Comment.Group threaded>
                  {Object.keys(ticket.comments).length === 1 && (
                    <Fragment>
                      <span>No comments yet</span>
                      <Divider hidden />
                    </Fragment>
                  )}
                  {Object.entries(ticket.comments).map(([key, comment]) => {
                    const commentKey = `comment-${key}`;
                    return (
                      <CommentList
                        commentCallBack={this.deleteComment}
                        comment={comment.comment}
                        name={comment.name}
                        ikey={commentKey}
                        ckey={key}
                        tkey={ticket.id}
                        email={comment.email}
                        avatar={comment.avatar}
                        timestamp={comment.timestamp}
                        user={this.state.user.email}
                      />
                    );
                  })}
                  <Form reply onSubmit={this.handleComment}>
                    <Form.TextArea
                      placeholder="Write comment here"
                      name="comment"
                      onChange={this.handleChange}
                      style={{ minHeight: 70, maxHeight: 110 }}
                    />
                    <Button
                      content="Add Comment"
                      labelPosition="left"
                      icon="edit"
                      primary
                      size="tiny"
                      onClick={() => this.setState({ postId: ticket.id })}
                    />
                  </Form>
                </Comment.Group>

                <Header as="h3">Files</Header>
                <Divider />
                {Object.keys(ticket.images).length === 1 && (
                  <span>No files</span>
                )}
                <List ordered>
                  {Object.entries(ticket.images).map(([key, image]) => {
                    const imageKey = `image-${key}`;
                    return (
                      <Fragment>
                        {imageKey !== "image-t" && (
                          <List.Item>
                            <List.Content
                              as="a"
                              href={image.url}
                              target="_blank"
                            >
                              {image.filename}
                            </List.Content>
                          </List.Item>
                        )}
                      </Fragment>
                    );
                  })}
                </List>

                <Button
                  compact
                  color="blue"
                  labelPosition="left"
                  size="small"
                  content="Upload File"
                  primary
                  icon="file outline"
                  onClick={() =>
                    this.setState({ postId: ticket.id, modal: true })
                  }
                />

                <FileModal
                  modal={this.state.modal}
                  closeModal={this.closeModal}
                  uploadFile={this.uploadFile}
                />
                <ProgressBar
                  uploadState={this.state.uploadState}
                  percentUploaded={this.state.percentUploaded}
                />
              </Card.Header>
              <Card.Footer>
                <small className="text-muted">
                  Posted {moment(ticket.timestamp).fromNow()}
                </small>
                <span style={{ color: "black" }}> |</span>{" "}
                <small className="text-muted">
                  {moment(ticket.timestamp).format("MMMM Do YYYY, h:mma")}
                </small>
              </Card.Footer>
            </Accordion.Content>
          </Segment>
        </Card>
      </div>
    ));

  isFormValid = ({ ticketName, ticketDetails, ticketSubject, value }) =>
    ticketName && ticketDetails && ticketSubject && value;

  isCommentValid = ({ comment }) => comment;

  isItemValid = ({ itemName, itemCost }) => itemName && itemCost;

  openModalT = () => this.setState({ modalT: true });

  closeModalT = () => this.setState({ modalT: false });

  openModalD = () => this.setState({ modalD: true });

  closeModalD = () => this.setState({ modalD: false });

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  openModalI = () => this.setState({ modalI: true });

  closeModalI = () => this.setState({ modalI: false });

  openModalC = () => this.setState({ modalC: true });

  closeModalC = () => this.setState({ modalC: false });

  openModalO = () => this.setState({ modalO: true });

  closeModalO = () => this.setState({ modalO: false });

  openModalF = () => this.setState({ modalF: true });

  closeModalF = () => this.setState({ modalF: false });

  render() {
    const {
      tickets,
      modalT,
      modalD,
      modalI,
      modalC,
      modalO,
      modalF,
      value,
      loading,
      searchLoading,
      searchResults,
      searchTerm,
      userType,
    } = this.state;

    return (
      <Container className="white-back" id="ticketback">
        <center>
          <h2 style={{ color: "black", margin: "10px 0px" }}>Complaints</h2>
        </center>
        <div
          style={{
            marginBottom: this.state.userType === "admin" ? "30px" : "0px",
          }}
        >
          <Input
            loading={searchLoading}
            onChange={this.handleSearchChange}
            size="small"
            icon="search"
            name="searchTerm"
            style={{ float: "right" }}
            placeholder="Search Complaints"
          />

          {userType === "user" && (
            <Button compact primary onClick={this.openModalT}>
              Write a Complaint &nbsp;
              <Icon name="write" />
            </Button>
          )}
        </div>
        <Divider hidden />
        <Modal
          basic
          dimmer="true"
          size="tiny"
          id="center-modal-create"
          open={modalT}
          onClose={this.closeModalT}
        >
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

        <Modal
          basic
          dimmer="true"
          size="tiny"
          id="center-modal"
          open={modalI}
          onClose={this.closeModalI}
        >
          <Modal.Header>Add item</Modal.Header>
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
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleItem}>
              <Icon name="checkmark" /> Add
            </Button>
            <Button color="red" inverted onClick={this.closeModalI}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>

        <Modal
          basic
          dimmer="true"
          size="tiny"
          id="center-modal"
          open={modalD}
          onClose={this.closeModalD}
        >
          <Modal.Header>Delete Complaint? </Modal.Header>

          <Modal.Actions>
            <Button color="red" inverted onClick={this.handleDelete}>
              <Icon name="trash" /> Delete
            </Button>
            <Button color="green" inverted onClick={this.closeModalD}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>

        <Modal
          basic
          dimmer="true"
          size="tiny"
          id="center-modal"
          open={modalC}
          onClose={this.closeModalC}
        >
          <Modal.Header>Close Complaint? </Modal.Header>

          <Modal.Actions style={{ alignContent: "center" }}>
            <Button color="green" inverted onClick={this.handleCloseTicket}>
              <Icon name="lock" /> Close
            </Button>
            <Button color="red" inverted onClick={this.closeModalC}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>

        <Modal
          basic
          dimmer="true"
          size="tiny"
          id="center-modal"
          open={modalO}
          onClose={this.closeModalO}
        >
          <Modal.Header>Open Complaint </Modal.Header>

          <Modal.Actions style={{ alignContent: "center" }}>
            <Button color="red" inverted onClick={this.handleOpenTicket}>
              <Icon name="unlock" /> Open
            </Button>
            <Button color="green" inverted onClick={this.closeModalO}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
        <div className="row justify-content-lg-center">
          {loading ? (
            <Spinner />
          ) : (
            <Fragment>
              <Accordion fluid>
                {searchTerm
                  ? this.displayTickets(searchResults)
                  : this.displayTickets(tickets)}
              </Accordion>
            </Fragment>
          )}
        </div>
      </Container>
    );
  }
}

export default connect(null, { setUserDetails, setTickets })(Ticket);
