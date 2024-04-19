const Marketplace = artifacts.require("./Marketplace.sol");

require("chai")
  .use(require("chai-as-promised"))
  .should();

contract("Marketplace", ([deployer, seller, buyer]) => {
  let marketplace;

  before(async () => {
    marketplace = await Marketplace.deployed();
  });

  describe("deployment", async () => {
    it("deploys successfully", async () => {
      const address = marketplace.address;
      assert.notEqual(address, "0x0", "has contract address");
      assert.notEqual(address, "", "has contract address");
      assert.notEqual(address, null, "has contract address");
      assert.notEqual(address, undefined, "has contract address");
    });

    it("has a name", async () => {
      const name = await marketplace.name();
      assert.equal(name, "VIT University Marketplace", "name is correct");
    });
  });

  describe("products", async () => {
    let result, productCount;

    before(async () => {
      result = await marketplace.createProduct(
        "iPhone X",
        web3.utils.toWei("1", "Ether"),
        { from: seller }
      );
      productCount = await marketplace.productCount();
    });

    it("creates products", async () => {
      // SUCCESS
      assert.equal(productCount, 1, "product count is correct");
      const event = result.logs[0].args;
      assert.equal(
        event.id.toNumber(),
        productCount.toNumber(),
        "id is correct"
      );
      assert.equal(event.name, "iPhone X", "name is correct");
      assert.equal(event.price, "1000000000000000000", "price is correct");
      assert.equal(event.owner, seller, "owner is correct");
      assert.equal(event.purchased, false, "purchased is correct");

      // FAILURE: Product must have a name
      await assert.rejects(
        marketplace.createProduct("", web3.utils.toWei("1", "Ether"), {
          from: seller,
        }),
        /revert/,
        "Product name cannot be empty"
      );
      // FAILURE: Product must have a price
      await assert.rejects(
        marketplace.createProduct("iPhone X", 0, { from: seller }),
        /revert/,
        "Product price must be greater than 0"
      );
    });

    it("lists products", async () => {
      const product = await marketplace.products(productCount);
      assert.equal(
        product.id.toNumber(),
        productCount.toNumber(),
        "id is correct"
      );
      assert.equal(product.name, "iPhone X", "name is correct");
      assert.equal(product.price, "1000000000000000000", "price is correct");
      assert.equal(product.owner, seller, "owner is correct");
      assert.equal(product.purchased, false, "purchased is correct");
    });

    it("sells products", async () => {
      // Track the seller balance before purchase
      let oldSellerBalance;
      oldSellerBalance = await web3.eth.getBalance(seller);
      oldSellerBalance = new web3.utils.BN(oldSellerBalance);

      // SUCCESS: Buyer makes purchase
      result = await marketplace.purchaseProduct(productCount, {
        from: buyer,
        value: web3.utils.toWei("1", "Ether"),
      });

      // Check logs
      const event = result.logs[0].args;
      assert.equal(
        event.id.toNumber(),
        productCount.toNumber(),
        "id is correct"
      );
      assert.equal(event.name, "iPhone X", "name is correct");
      assert.equal(event.price, "1000000000000000000", "price is correct");
      assert.equal(event.owner, buyer, "owner is correct");
      assert.equal(event.purchased, true, "purchased is correct");

      // Check that seller received funds
      let newSellerBalance;
      newSellerBalance = await web3.eth.getBalance(seller);
      newSellerBalance = new web3.utils.BN(newSellerBalance);

      let price;
      price = web3.utils.toWei("1", "Ether");
      price = new web3.utils.BN(price);

      const expectedBalance = oldSellerBalance.add(price);

      assert.equal(newSellerBalance.toString(), expectedBalance.toString());

      // FAILURE: Tries to buy a product that does not exist, i.e., product must have valid id
      await assert.rejects(
        marketplace.purchaseProduct(99, {
          from: buyer,
          value: web3.utils.toWei("1", "Ether"),
        }),
        /revert/,
        "Product with given id does not exist"
      );
      // FAILURE: Buyer tries to buy without enough ether
      await assert.rejects(
        marketplace.purchaseProduct(productCount, {
          from: buyer,
          value: web3.utils.toWei("0.5", "Ether"),
        }),
        /revert/,
        "Insufficient ether provided to purchase the product"
      );
      // FAILURE: Deployer tries to buy the product, i.e., product can't be purchased twice
      await assert.rejects(
        marketplace.purchaseProduct(productCount, {
          from: deployer,
          value: web3.utils.toWei("1", "Ether"),
        }),
        /revert/,
        "Deployer cannot purchase the product"
      );
    });
  });
});
