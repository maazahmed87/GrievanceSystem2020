import React, { Fragment } from "react";
import { Form, Input, Image } from "semantic-ui-react";
import firebase from "../firebase";

class Account extends React.Component {
  state = {
    user: this.props.currentUser,
    usersRef: firebase.database().ref("users"),
    name: this.props.userDetails.name,
    email: this.props.userDetails.email,
    photo: this.props.currentUser.photoURL,
    details: "",
    loading: false,
    domain: this.props.userDetails.domain,
    ssid: this.props.userDetails.ssid,
    faculty: this.props.userDetails.faculty,
    type: this.props.userDetails.type,
  };

  componentDidMount() {
    this.addListeners();
    let user = this.state.name;
    let title = "Account | " + user;
    document.title = title;
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

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { type, email, name, faculty, domain, ssid, loading } = this.state;

    return (
      <Fragment style={{ textTransform: "capitalize" }}>
        <center>
          <h2 style={{ color: "black", margin: "10px 0px" }}>Account Info</h2>
          <Image src={this.state.photo} size="tiny" circular />
        </center>
        <Form loading={loading} style={{ margin: "0px 15px" }}>
          <Form.Group>
            <Form.Field
              control={Input}
              width="6"
              label="Full Name"
              placeholder="Full Name"
              name="name"
              value={name}
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
              value={email}
              readOnly
            />

            {type !== "admin" && (
              <Form.Field
                width="8"
                control={Input}
                label={faculty === true ? "SSID" : "USN"}
                placeholder={faculty ? "SSID" : "USN"}
                name="ssid"
                value={ssid}
                readOnly
                style={{
                  textTransform: "uppercase!important",
                  fontWeight: "bold",
                }}
              />
            )}

            {type === "admin" && (
              <Form.Field
                width="8"
                control={Input}
                label="Department"
                placeholder="Department"
                name="domain"
                value={domain}
                readOnly
              />
            )}
          </Form.Group>
        </Form>
      </Fragment>
    );
  }
}
export default Account;
