import React, { Component } from "react";
import "./App.css";
import Marketplace from "../abis/Marketplace.json";
import Navbar from "./Navbar";
import Main from "./Main";
import Web3 from 'web3';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: "",
      productCount: 0,
      products: [],
      loading: true,
    };
    this.createProduct = this.createProduct.bind(this);
    this.purchaseProduct = this.purchaseProduct.bind(this);
  }

  async componentDidMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    try {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
      } else {
        window.alert(
          "Non-Ethereum browser detected. You should consider trying MetaMask!"
        );
      }
    } catch (error) {
      console.error("Error loading Web3: ", error);
    }
  }
  
  async loadBlockchainData() {
    try {
      const web3 = window.web3;
      if (!web3) {
        throw new Error("Web3 instance not found.");
      }
      
      // Load account
      const accounts = await web3.eth.getAccounts();
      this.setState({ account: accounts[0] });
  
      const networkId = await web3.eth.net.getId();
      const networkData = Marketplace.networks[networkId];
      if (networkData) {
        const marketplace = new web3.eth.Contract(Marketplace.abi, networkData.address);
        this.setState({ marketplace });
  
        const productCount = await marketplace.methods.productCount().call();
        this.setState({ productCount });
  
        // Fetch products
        const products = [];
        for (let i = 1; i <= productCount; i++) {
          const product = await marketplace.methods.products(i).call();
          products.push(product);
        }
        this.setState({ products, loading: false }); // Update products array in state
      } else {
        window.alert('Marketplace contract not deployed to detected network.');
        this.setState({ loading: false });
      }
    } catch (error) {
      console.error("Error loading blockchain data:", error);
      this.setState({ loading: false });
    }
  }
  
  

  createProduct(name, price) {
    if (!this.state.marketplace) return;
    this.setState(prevState => ({ loading: true }));
    this.state.marketplace.methods
      .createProduct(name, price)
      .send({ from: this.state.account })
      .once("receipt", (receipt) => {
        this.setState({ loading: false });
      });
  };

  purchaseProduct(id, price) {
    if (!this.state.marketplace) return;
    this.setState(prevState => ({ loading: true }));
    this.state.marketplace.methods.purchaseProduct(id).send({ from: this.state.account, value: price })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex">
              {this.state.loading ? (
                <div id="loader" className="text-center">
                  <p className="text-center">Loading...</p>
                </div>
              ) : (
                <Main
                  products={this.state.products}
                  createProduct={this.createProduct}
                  purchaseProduct={this.purchaseProduct}
                />
              )}
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
