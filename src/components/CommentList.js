import React, { Fragment } from "react";
import { Comment, Button, Popup } from "semantic-ui-react";
import moment from "moment";

const CommentList = (props) => {
  return (
    <Fragment>
      {props.ikey !== "comment-p" && (
        <Comment>
          <Comment.Avatar src={props.avatar} />
          <Comment.Content>
            <Comment.Author as="a">{props.name}</Comment.Author>
            <Comment.Metadata>{props.email}</Comment.Metadata>
            <Comment.Text style={{ fontWeight: "light!important" }}>
              {props.comment}
            </Comment.Text>
            <Comment.Metadata>
              {props.user === props.email && (
                <Popup
                  content="Delete Comment"
                  inverted
                  size="tiny"
                  position="top right"
                  trigger={
                    <Comment.Actions>
                      <Comment.Action
                        onClick={() =>
                          props.commentCallBack(props.ckey, props.tkey)
                        }
                      >
                        Delete{" "}
                        <span style={{ fontWeight: "bolder ", color: "black" }}>
                          |
                        </span>
                      </Comment.Action>
                    </Comment.Actions>
                  }
                />
              )}
              {"  "}
              Posted {moment(props.timestamp).fromNow()}
            </Comment.Metadata>
          </Comment.Content>
        </Comment>
      )}
    </Fragment>
  );
};
export default CommentList;
