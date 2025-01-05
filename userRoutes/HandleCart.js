import e from "express";
import Product from "../Models/products.model.js";
import User from "../Models/user.model.js";

const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.id);
    const cart = user.cart;
    if (cart.length === 0) return res.send([]);
    const onlyKeys = [...cart.keys()];
    const product = await Product.find({
      _id:{$in:onlyKeys}
    }).select([
      "category",
      "title",
      "_id",
      "id",
      "price",
      "discount",
      "thumbnail",
    ]);
    //add amount on product
    const amtAdded = product.map((e)=> {
      const getAmt = cart.get(e._id)
      return {...e._doc,amount:getAmt.amount}
    })
    
     res.status(200).send(amtAdded);
  } catch (err) {
    console.log(err);

    res.status(500).send("Internal server error");
  }
};

const addToCart = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.id });
    const cart = user.cart;
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).send("Invalid product to add on cart!");
    }
    let amt = 0;
    if (cart.has(productId)) amt = parseInt(cart.get(productId).amount);

    cart.set(productId, { amount: ++amt });
    user.cart = cart;
    await user.save();
    res.send(cart);
  } catch (err) {
    console.log(err);

    res.status(500).send("Internal server error");
  }
};
const updateCart = async (req, res) => {
  try {
    const productId = req.params.id;
    const { amount } = req.body;
    const user = await User.findOne({ _id: req.id });
    const cart = user.cart;
    const parseAmount = parseInt(amount);
    const getRequireProduct = cart.get(productId);
    if (isNaN(parseAmount) || !getRequireProduct) {
      return res.status(400).send("Invalid request");
    }

    getRequireProduct.amount = parseAmount;
    if (getRequireProduct.amount <= 0) {
      cart.delete(productId);
    } else {
      cart.set(productId, getRequireProduct);
    }
    user.cart = cart;
    user.markModified("cart");
    await user.save();
    res.send(cart);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};
const deleteCart = async (req, res) => {
  try {
    const productId = req.params.id;
    const user = await User.findOne({ _id: req.id });
    const cart = user.cart;
    const getRequireProduct = cart.get(productId);
    if (!getRequireProduct) {
      return res.status(400).send("Invalid request");
    }
    cart.delete(productId);
    user.cart = cart;
    user.markModified("cart");
    await user.save();
    res.send(cart);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};
export { getCart, addToCart, updateCart, deleteCart };
