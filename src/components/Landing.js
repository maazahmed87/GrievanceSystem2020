import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import "./App.css";
import styles from "./Button.module.css";
import { Link } from "react-router-dom";

class Landing extends React.Component {
  render() {
    return (
      <Container fluid id={styles.landingback}>
        <Row className="justify-content-md-center">
          <Col xs="12" lg="12" sm="12" md="12" id={styles.landbox}>
            <span id={styles.landtext}>Grievance System</span>
            <br />
            <div className={styles.landsub}>Report your grievances here</div>
            <Link
              className={styles.underline_btn}
              style={{ color: "#1c1c1c" }}
              to="/register"
            >
              Sign Up
            </Link>{" "}
            <Link
              className={styles.underline_btn}
              style={{ color: "#1c1c1c" }}
              to="/login"
            >
              Login
            </Link>
          </Col>
        </Row>
      </Container>
    );
  }
}
export default Landing;
