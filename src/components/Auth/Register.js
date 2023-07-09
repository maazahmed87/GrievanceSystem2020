import React from "react";
import firebase from "../../firebase";
import md5 from "md5";
import {
  Grid,
  Form,
  Segment,
  Button,
  Radio,
  Header,
  Message,
} from "semantic-ui-react";
import { Link } from "react-router-dom";
import styles from "../Button.module.css";

class Register extends React.Component {
  state = {
    username: "",
    email: "",
    usn: "",
    password: "",
    passwordConfirmation: "",
    errors: [],
    type: "",
    value: "",
    faculty: false,
    loading: false,
    usersRef: firebase.database().ref("users"),
  };

  isFormValid = () => {
    let errors = [];
    let error;

    if (this.isFormEmpty(this.state)) {
      error = { message: "Fill in all fields" };
      this.setState({ errors: errors.concat(error) });
      return false;
    } else if (!this.isPasswordValid(this.state)) {
      error = { message: "Password is invalid" };
      this.setState({ errors: errors.concat(error) });
      return false;
    } else {
      return true;
    }
  };

  isFormEmpty = ({ username, email, usn, password, passwordConfirmation }) => {
    return (
      !username.length ||
      !email.length ||
      !usn.length ||
      !password.length ||
      !passwordConfirmation.length
    );
  };

  isPasswordValid = ({ password, passwordConfirmation }) => {
    if (password.length < 6 || passwordConfirmation.length < 6) {
      return false;
    } else if (password !== passwordConfirmation) {
      return false;
    } else {
      return true;
    }
  };

  displayErrors = (errors) =>
    errors.map((error, i) => <p key={i}>{error.message}</p>);

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleRadio = (e, { value }) => {
    this.setState({ value });
    if (value === "yes") {
      this.setState({ faculty: true });
    } else {
      this.setState({ faculty: false });
    }
  };

  handleSubmit = (event) => {
    event.preventDefault();
    if (this.isFormValid()) {
      this.setState({ errors: [], loading: true });
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then((createdUser) => {
          console.log(createdUser);
          createdUser.user
            .updateProfile({
              displayName: this.state.username,
              email: this.state.email,
              photoURL: `http://gravatar.com/avatar/${md5(
                createdUser.user.email
              )}?d=identicon`,
            })
            .then(() => {
              this.saveUser(createdUser).then(() => {
                console.log("user saved");
              });
            })
            .catch((err) => {
              console.error(err);
              this.setState({
                errors: this.state.errors.concat(err),
                loading: false,
              });
            });
        })
        .catch((err) => {
          console.error(err);
          this.setState({
            errors: this.state.errors.concat(err),
            loading: false,
          });
        });
    }
  };

  saveUser = (createdUser) => {
    let u = this.state.usn;
    return this.state.usersRef.child(createdUser.user.uid).set({
      name: createdUser.user.displayName,
      avatar: createdUser.user.photoURL,
      usn: u,
      faculty: this.state.faculty,
      email: createdUser.user.email,
      type: 'user'
    });
  };

  handleInputError = (errors, inputName) => {
    return errors.some((error) =>
      error.message.toLowerCase().includes(inputName)
    )
      ? "error"
      : "";
  };

  render() {
    const {
      username,
      email,
      usn,
      password,
      passwordConfirmation,
      type,
      errors,
      loading,
    } = this.state;

    return (
      <Grid
        textAlign="center"
        verticalAlign="middle"
        className="app"
        id={styles.registrationback}
      >
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" icon color="blue" textAlign="center">
            Sign Up
          </Header>
          <Form onSubmit={this.handleSubmit} size="large">
            <Segment stacked>
              <Form.Input
                fluid
                name="username"
                icon="user"
                iconPosition="left"
                placeholder="Full Name"
                onChange={this.handleChange}
                value={username}
                type="text"
              />

              <Form.Input
                fluid
                name="email"
                icon="mail"
                iconPosition="left"
                placeholder="Email Address"
                onChange={this.handleChange}
                value={email}
                className={this.handleInputError(errors, "email")}
                type="email"
              />

              <Segment.Group horizontal textAlign="left">
                <Segment compact>Select account type:</Segment>
                <Segment compact>
                  <Radio
                    label="Student"
                    name="radioGroup"
                    value="no"
                    checked={this.state.value === "no"}
                    onChange={this.handleRadio}
                  />
                </Segment>
                <Segment compact>
                  <Radio
                    label="Faculty"
                    name="radioGroup"
                    value="yes"
                    checked={this.state.value === "yes"}
                    onChange={this.handleRadio}
                  />
                </Segment>
              </Segment.Group>

              <Form.Input
                fluid
                name="usn"
                icon="asterisk"
                iconPosition="left"
                placeholder={
                  this.state.faculty ? "Faculty ID" : "Universal Serial Number"
                }
                onChange={this.handleChange}
                value={usn}
                className={this.handleInputError(errors, "usn")}
                type="text"
              />

              <Form.Input
                fluid
                name="password"
                icon="lock"
                iconPosition="left"
                placeholder="Password"
                onChange={this.handleChange}
                value={password}
                className={this.handleInputError(errors, "password")}
                type="password"
              />

              <Form.Input
                fluid
                name="passwordConfirmation"
                icon="repeat"
                iconPosition="left"
                placeholder="Password Confirmation"
                onChange={this.handleChange}
                value={passwordConfirmation}
                className={this.handleInputError(errors, "password")}
                type="password"
              />

              <Button
                disabled={loading}
                className={loading ? "loading" : ""}
                color="blue"
                fluid
                size="large"
              >
                Submit
              </Button>
            </Segment>
          </Form>
          {errors.length > 0 && (
            <Message error>
              <h3>Error</h3>
              {this.displayErrors(errors)}
            </Message>
          )}
          <Message>
            Already a user? <Link to="/login">Login</Link>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default Register;
