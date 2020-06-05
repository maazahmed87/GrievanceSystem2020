import React, { Fragment } from "react";

class ItemList extends React.Component {
  render() {
    const { name, cost, ikey } = this.props;

    return (
      <Fragment>
        {ikey !== "item-i" && (
          <tr style={{ color: "white" }}>
            <td>{name}</td>
            <td>{cost}</td>
          </tr>
        )}
      </Fragment>
    );
  }
}
export default ItemList;
