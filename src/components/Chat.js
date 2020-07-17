import React from "react";
import { connect } from "react-redux";
import Container from "react-bootstrap/Container";
import "./grid.css";
import SidePanel from "./Chat/SidePanel/SidePanel";
import Messages from "./Chat/Messages/Messages";

const Chat = ({
  currentUser,
  currentChannel,
  isPrivateChannel,
  userPosts,
  primaryColor,
  secondaryColor,
}) => (
  <Container fluid id="zero-pad">
    <div className="roww app" style={{ background: secondaryColor }}>
      <div className="coll-3" style={{ background: "#4c3c4c" }}>
        <SidePanel
          key={currentUser && currentUser.uid}
          currentUser={currentUser}
          primaryColor={primaryColor}
        />
      </div>

      <div className="coll-9">
        <Messages
          key={currentChannel && currentChannel.id}
          currentChannel={currentChannel}
          currentUser={currentUser}
          isPrivateChannel={isPrivateChannel}
        />
      </div>
    </div>
  </Container>
);

const mapStateToProps = (state) => ({
  currentUser: state.user.currentUser,
  currentChannel: state.channel.currentChannel,
  isPrivateChannel: state.channel.isPrivateChannel,
  userPosts: state.channel.userPosts,
});

export default connect(mapStateToProps)(Chat);
