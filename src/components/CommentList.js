import React, { Fragment } from "react";
import { Comment } from "semantic-ui-react";
import moment from "moment";

class CommentList extends React.Component {
  render() {
    const { comment, name, ckey, email, avatar, timestamp } = this.props;

    return (
      <Fragment>
        {ckey !== "comment-p" && (
          <Comment>
            <Comment.Avatar src={avatar} />
            <Comment.Content>
              <Comment.Author as="a">{name}</Comment.Author>
              <Comment.Metadata>{email}</Comment.Metadata>
              <Comment.Text style={{ fontWeight: "light!important" }}>
                {comment}
              </Comment.Text>
              <Comment.Metadata>
                Posted {moment(timestamp).fromNow()}
              </Comment.Metadata>
            </Comment.Content>
          </Comment>
        )}
      </Fragment>
    );
  }
}
export default CommentList;
