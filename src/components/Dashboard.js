import React, { Fragment } from "react";
import firebase from "../firebase";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "../Spinner";
import { Pie, Doughnut } from "react-chartjs-2";
import "./App.css";

class Dashboard extends React.Component {
  state = {
    user: this.props.currentUser,
    userType: "",
    domain: "",
    tickets: [],
    cat1Tickets: [],
    cat2Tickets: [],
    cat3Tickets: [],
    pendingCount: 0,
    closedCount: 0,
    userDetails: [],
    loading: "false",
    ticketsRef: firebase.database().ref("tickets"),
    usersRef: firebase.database().ref("users"),
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
    message: "",
    errors: [],
    chart1: {
      labels: ["Category1", "Category 2", "Category 3"],
      datasets: [
        {
          data: [],
          backgroundColor: ["#FF6384", "#36A2EB", "#FF9F40"],
        },
      ],
      title: "Tickets category chart",
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    },
    chart2: {
      labels: ["Pending", "Closed"],
      datasets: [
        {
          data: [],
          backgroundColor: ["#FFC154", "#47B39C"],
        },
      ],
      title: "Status Pie Chart",
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    },
    chart3: {
      labels: ["Flagged", "Not Flagged"],
      datasets: [
        {
          data: [],
          backgroundColor: ["#FF483A", "#1D81A2"],
        },
      ],
      title: "Flagged Pie chart",
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    },
  };

  componentDidMount() {
    this.addListeners();
    let user = this.state.user.displayName;
    let title = "Dashboard | " + user;
    document.title = title;
  }

  componentWillMount() {
    this.addListeners();
  }

  getRandomColor() {
    let colors = ["primary", "success", "danger", "warning", "info", "dark"];
    var color = colors[Math.floor(Math.random() * colors.length)];
    return color;
  }

  addListeners = () => {
    let userType = this.state.userType;
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
    if (userType === "user") {
      this.loadUserTickets();
    } else {
      this.loadAdminTickets();
    }

    let loadedUserDetails = [];
    this.state.usersRef.on("child_added", (snap) => {
      if (user.email === snap.val().email) {
        loadedUserDetails.push(snap.val());
      }
      this.setState({ userDetails: loadedUserDetails, loading: false });
    });
  };

  ticketViewTotal = () => {
    let option = "tickets";
    this.props.callbackFromParent(option);
  };

  ticketViewPending = () => {
    let option = "tickets";
    let status = "pending";
    this.props.callBackOption(option, status);
  };

  ticketViewClosed = () => {
    let option = "tickets";
    let status = "closed";
    this.props.callBackOption(option, status);
  };

  loadUserTickets = () => {
    let loadedTickets = [];
    let loadedCat1Tickets = [];
    let loadedCat2Tickets = [];
    let loadedCat3Tickets = [];
    let loadedPendingCount = 0;
    let c1 = 0;
    let c2 = 0;
    let c3 = 0;
    let user = this.state.user;

    this.state.ticketsRef.on("child_added", (snap) => {
      if (
        this.state.userType === "user" &&
        user.email === snap.val().createdBy.email
      ) {
        loadedTickets.push(snap.val());
        if ("category 1" === snap.val().category) {
          loadedCat1Tickets.push(snap.val());
          c1++;
        }
        if ("category 2" === snap.val().category) {
          loadedCat2Tickets.push(snap.val());
          c2++;
        }
        if ("category 3" === snap.val().category) {
          loadedCat3Tickets.push(snap.val());
          c3 = c3 + 1;
        }
        if ("pending" === snap.val().status) {
          loadedPendingCount++;
        }
      }

      let completedCount = loadedTickets.length - loadedPendingCount;

      let countArray = [c1, c2, c3];
      let statusArray = [loadedPendingCount, completedCount];

      let categoryDataset = this.state.chart1.datasets.slice(0);
      categoryDataset[0].data = countArray;

      let statusDataset = this.state.chart2.datasets.slice(0);
      statusDataset[0].data = statusArray;

      this.setState({
        chart: Object.assign({}, this.state.data, {
          datasets: categoryDataset,
          statusDataset,
        }),
      });

      this.setState({
        tickets: loadedTickets,
        closedCount: completedCount,
        cat1Tickets: loadedCat1Tickets,
        cat2Tickets: loadedCat2Tickets,
        cat3Tickets: loadedCat3Tickets,
        pendingCount: loadedPendingCount,
      });
    });
  };

  loadAdminTickets = () => {
    let domain = this.state.domain;
    let loadedPendingCount = 0;
    let loadedFlagCount = 0;
    let loadedUnFlagCount = 0;
    let loadedTickets = [];

    this.state.ticketsRef.on("child_added", (snap) => {
      if (domain === snap.val().category) {
        loadedTickets.push(snap.val());
        if (snap.val().status === "pending") {
          loadedPendingCount++;
        }
        if (snap.val().flag === "true") {
          loadedFlagCount++;
        } else {
          loadedUnFlagCount++;
        }
      }
    });
    let completedCount = loadedTickets.length - loadedPendingCount;
    let flagArray = [loadedFlagCount, loadedUnFlagCount];
    let statusArray = [loadedPendingCount, completedCount];

    let statusDataset = this.state.chart2.datasets.slice(0);
    statusDataset[0].data = statusArray;

    let flagDataset = this.state.chart3.datasets.slice(0);
    flagDataset[0].data = flagArray;

    this.setState({
      chart: Object.assign({}, this.state.data, {
        datasets: statusDataset,
      }),
    });

    this.setState({
      tickets: loadedTickets,
      closedCount: completedCount,
      pendingCount: loadedPendingCount,
    });
  };

  render() {
    const {
      tickets,
      pendingCount,
      loading,
      closedCount,
      chart1,
      chart2,
      chart3,
    } = this.state;

    return (
      <Container className="white-back" fluid>
        <center>
          <h2 style={{ color: "black", margin: "10px 0px" }}>Dashboard</h2>
        </center>
        {loading ? (
          <Spinner />
        ) : (
          <Fragment>
            <Row>
              <Col
                sm={4}
                style={{
                  height: "25vh",
                }}
                onClick={this.ticketViewTotal}
              >
                <Card
                  style={{
                    width: "auto",
                    height: "100%",
                    textAlign: "center",
                  }}
                >
                  <Card.Header as="h5">Total Tickets</Card.Header>
                  <Card.Body>
                    <div style={{ fontSize: "62px", marginTop: "10%" }}>
                      {tickets.length}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col
                sm={4}
                style={{
                  height: "25vh",
                }}
                onClick={this.ticketViewPending}
              >
                <Card
                  style={{
                    width: "auto",
                    height: "100%",
                    textAlign: "center",
                  }}
                >
                  <Card.Header as="h5">Pending Tickets</Card.Header>
                  <Card.Body>
                    <div style={{ fontSize: "62px", marginTop: "10%" }}>
                      {pendingCount}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col
                sm={4}
                style={{
                  height: "25vh",
                }}
                onClick={this.ticketViewClosed}
              >
                <Card
                  style={{
                    width: "auto",
                    height: "100%",
                    textAlign: "center",
                  }}
                >
                  <Card.Header as="h5">Completed Tickets</Card.Header>
                  <Card.Body>
                    <div style={{ fontSize: "62px", marginTop: "10%" }}>
                      {closedCount}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            <Row style={{ margin: "20px 0px" }}>
              {this.state.userType === "user" && (
                <Col
                  sm={6}
                  style={{
                    textAlign: "center",
                    border: "1px solid #dfdfdf",
                    borderCollapse: "collapse",
                  }}
                >
                  <h2 style={{ color: "black" }}>
                    Category wise ticket Distribution
                  </h2>
                  <Pie data={chart1} />
                </Col>
              )}

              <Col
                sm={6}
                style={{
                  textAlign: "center",
                  paddingBottom: "15px",
                  border: "1px solid #dfdfdf",
                  borderCollapse: "collapse",
                }}
              >
                <h2 style={{ color: "black" }}>
                  Status wise ticket Distribution
                </h2>
                <Doughnut data={chart2} />
              </Col>

              {this.state.userType === "admin" && (
                <Col
                  sm={6}
                  style={{
                    textAlign: "center",
                    paddingBottom: "15px",
                    border: "1px solid #dfdfdf",
                    borderCollapse: "collapse",
                  }}
                >
                  <h2 style={{ color: "black" }}>
                    Tickets flagged Distribution
                  </h2>
                  <Pie data={chart3} />
                </Col>
              )}
            </Row>
          </Fragment>
        )}
      </Container>
    );
  }
}

export default Dashboard;
