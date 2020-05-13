import React, { Fragment } from "react";
import { Form, Input, Image } from "semantic-ui-react";
import firebase from "../firebase";

class Account extends React.Component {
  state = {
    user: this.props.currentUser,
    usersRef: firebase.database().ref("users"),
    name: this.props.currentUser.displayName,
    email: this.props.currentUser.email,
    photo: this.props.currentUser.photoURL,
    details: [],
    loading: false,
  };

  componentDidMount() {
    this.addListeners();
  }

  addListeners = () => {
    let userDetails = [];
    this.setState({ loading: true });
    let user = this.state.user;
    this.state.usersRef.on("child_added", (snap) => {
      if (user.email === snap.val().email) {
        userDetails.push(snap.val());
      }
      let finalArray = Object.keys(userDetails).map((i) => userDetails[i]);
      this.setState({ details: finalArray, loading: false });
    });
  };

  displayUser = (details) =>
    details > 0 &&
    details.map((detail) => (
      <Form.Group>
        <Form.Field
          width="8"
          control={Input}
          label="USN"
          placeholder="USN"
          name="email"
          value={detail.usn}
          readOnly
        />
      </Form.Group>
    ));

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { details } = this.state;

    return (
      <Fragment>
        <center>
          <h2 style={{ color: "black", margin: "10px 0px" }}>Account Info</h2>
          <Image src={this.state.photo} size="small" circular />
        </center>
        <Form>
          <Form.Group>
            <Form.Field
              control={Input}
              width="8"
              label="Full Name"
              placeholder="Full Name"
              name="name"
              value={this.state.name}
              onChange={this.handleChange}
            />
          </Form.Group>
          <Form.Group>
            <Form.Field
              width="8"
              control={Input}
              label="Email"
              placeholder="Email"
              name="email"
              value={this.state.details}
              readOnly
            />
          </Form.Group>
          {this.displayUser(this.state.details)}
        </Form>
      </Fragment>
    );
  }
}
export default Account;
