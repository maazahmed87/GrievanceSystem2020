import React, { Fragment } from "react";
import UserPanel from "./UserPanel";
import Ticket from "./Ticket";
import { Menu, Grid } from "semantic-ui-react";

class SidePanel extends React.Component {
  render() {
    const { currentUser } = this.props;

    return (
      <Grid>
        <Grid.Row>
          <Grid.Column width={5} stretched>
            <Menu
              size="large"
              vertical
              stretched
              style={{ background: "#4c3c4c", fontSize: "1.2rem" }}
            >
              <UserPanel currentUser={currentUser} />
            </Menu>
          </Grid.Column>
          <Grid.Column width={2} stretched></Grid.Column>
          <Grid.Column width={8} stretched>
            <Ticket currentUser={currentUser} />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default SidePanel;
