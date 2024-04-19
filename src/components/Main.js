import React, { Component } from "react";

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      productName: "",
      productPrice: "",
    };
  }

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({
      [name]: value,
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const { productName, productPrice } = this.state;
    const priceInWei = window.web3.utils.toWei(
      productPrice.toString() || "0",
      "Ether"
    );
    this.props.createProduct(productName, priceInWei);
    this.setState({
      productName: "",
      productPrice: "",
    });
  };

  render() {
    const { products, purchaseProduct } = this.props;
    return (
      <div id="content">
        <h1>Add Product</h1>
        <form onSubmit={this.handleSubmit}>
          <div className="form-group mr-sm-2">
            <input
              type="text"
              name="productName"
              value={this.state.productName}
              onChange={this.handleInputChange}
              className="form-control"
              placeholder="Product Name"
              required
            />
          </div>
          <div className="form-group mr-sm-2">
            <input
              type="text"
              name="productPrice"
              value={this.state.productPrice}
              onChange={this.handleInputChange}
              className="form-control"
              placeholder="Product Price"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Add Product
          </button>
        </form>
        <p> </p>
        <h2>Buy Product</h2>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Price</th>
              <th scope="col">Owner</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, key) => (
              <tr key={key}>
                <th scope="row">{product.id.toString()}</th>
                <td>{product.name}</td>
                <td>
                  {window.web3.utils.fromWei(product.price.toString(), "Ether")}{" "}
                  Eth
                </td>
                <td>{product.owner}</td>
                <td>
                  {!product.purchased && (
                    <button
                      onClick={() => purchaseProduct(product.id, product.price)}
                      className="btn btn-primary"
                    >
                      Buy
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Main;
