import React, { Fragment } from "react";
import { Table, Button, Popup } from "semantic-ui-react";

const ItemList = (props) => {
  return (
    <Fragment>
      {props.ikey !== "item-i" && (
        <Table.Row key={props.tkey}>
          <Table.Cell>{props.name}</Table.Cell>
          <Table.Cell>
            {props.cost}

            {props.user === "admin" && (
              <Popup
                content="Delete item"
                inverted
                size="tiny"
                position="top right"
                trigger={
                  <Button
                    icon="delete"
                    onClick={() => props.itemCallBack(props.tkey, props.ckey)}
                    style={{
                      float: "right",
                      outline: "none!important",
                      background: "transparent",
                      border: "none",
                    }}
                  />
                }
              />
            )}
          </Table.Cell>
        </Table.Row>
      )}
    </Fragment>
  );
};

export default ItemList;
