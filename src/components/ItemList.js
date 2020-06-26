import React, { Fragment } from "react";
import { Table } from "semantic-ui-react";

class ItemList extends React.Component {
  render() {
    const { name, cost, ikey } = this.props;

    return (
      <Fragment>
        {ikey !== "item-i" && (
          <Table.Row>
            <Table.Cell>{name}</Table.Cell>
            <Table.Cell>{cost}</Table.Cell>
          </Table.Row>
        )}
      </Fragment>
    );
  }
}
export default ItemList;
