import React, { Fragment } from "react";
import { Comment, Button, Popup } from "semantic-ui-react";
import moment from "moment";

const CommentList = (props) => {
  return (
    <Fragment>
      {props.ckey !== "comment-p" && (
        <Comment>
          <Comment.Avatar src={props.avatar} />
          <Comment.Content>
            <Comment.Author as="a">{props.name}</Comment.Author>
            <Comment.Metadata>{props.email}</Comment.Metadata>
            <Comment.Text style={{ fontWeight: "light!important" }}>
              {props.comment}
            </Comment.Text>
            <Comment.Metadata>
              Posted {moment(props.timestamp).fromNow()}
              <br />
              <Popup
                content="Delete item"
                inverted
                size="tiny"
                position="top right"
                trigger={
                  <Button
                    icon="delete"
                    onClick={() =>
                      props.commentCallBack(props.tkey, props.ckey)
                    }
                    style={{
                      float: "right",
                      outline: "none!important",
                      background: "transparent",
                      border: "none",
                    }}
                  />
                }
              />
            </Comment.Metadata>
          </Comment.Content>
        </Comment>
      )}
    </Fragment>
  );
};
export default CommentList;