import React from "react";
import firebase from "../../firebase";
import {
  Grid,
  Form,
  Segment,
  Button,
  Header,
  Icon,
  Message,
} from "semantic-ui-react";
import styles from "../Button.module.css";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  withRouter,
} from "react-router-dom";

class Reset extends React.Component {
  state = {
    email: "",
    errors: [],
    loading: false,
    display: false,
  };

  displayErrors = (errors) =>
    errors.map((error, i) => <p key={i}>{error.message}</p>);

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  changeRoute = () => {
    this.props.history.push("/login");
  };

  handleReset = (event) => {
    event.preventDefault();
    if (this.isFormValid(this.state)) {
      this.setState({ errors: [], loading: true });
      firebase
        .auth()
        .sendPasswordResetEmail(this.state.email)
        .then((signedInUser) => {
          this.setState({ loading: false, display: true });
          console.log("Email sent");
          setTimeout(() => this.setState({ display: false, email: "" }), 10000);
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

  isFormValid = ({ email }) => email;

  handleInputError = (errors, inputName) => {
    return errors.some((error) =>
      error.message.toLowerCase().includes(inputName)
    )
      ? "error"
      : "";
  };

  render() {
    const { email, errors, loading, display } = this.state;

    return (
      <Grid
        textAlign="center"
        verticalAlign="middle"
        className="app"
        id={styles.resetback}
      >
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" color="blue" textAlign="center" size="large" icon>
            <Icon name="repeat" />
            Reset password
          </Header>
          <Form onSubmit={this.handleReset} size="large">
            <Segment stacked>
              <Message>
                <p>
                  Enter your email and we'll send you a link to reset your
                  password
                </p>
              </Message>
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
              <Button
                disabled={loading}
                className={loading ? "loading" : ""}
                color="blue"
                fluid
                size="large"
              >
                Reset password <Icon name="arrow right" />
              </Button>
            </Segment>
            <Button basic attached="bottom" onClick={this.changeRoute}>
              Back to login
            </Button>
          </Form>
          {errors.length > 0 && (
            <Message error>
              <h3>Error</h3>
              {this.displayErrors(errors)}
            </Message>
          )}
          {display && (
            <Message positive>
              <Message.Header>Email has been sent to {email}</Message.Header>
              <p>
                Check your <b>email</b> to follow the link to reset your
                password.
              </p>
            </Message>
          )}
        </Grid.Column>
      </Grid>
    );
  }
}

export default Reset;
