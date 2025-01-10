import Product from "../Models/products.model.js";
import User from "../Models/user.model.js";
import { ObjectId } from "mongodb";



const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.id);
    const cart = user.cart;
    if (cart.length === 0) return res.send([]);

    res.status(200).send(cart);
  } catch (err) {
    console.log(err);

    res.status(500).send("Internal server error");
  }
};

const addToCart = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.id });
    const cart = user.cart;
    const { productId, title, thumbnail, category, price } = req.body;

    if (
      !(productId && title && thumbnail && category && price) ||
      !ObjectId.isValid(productId)
    ) {
      return res.status(400).send("Invalid product to add on cart!");
    }

    let amt = 0;
    const formattedId = productId;
    const checkCart = cart.get(formattedId);
    if (checkCart) amt = parseInt(checkCart.amount);

    cart.set(formattedId, { amount: ++amt, price, title, thumbnail, category });
    user.cart = cart;
    await user.save();
    const getCartProductDetails = cart;
    res.send(getCartProductDetails);
  } catch (err) {
    console.log(err);

    res.status(500).send("Internal server error");
  }
};
const updateCart = async (req, res) => {
  try {
    const productId = req.params.id;
    if(!ObjectId.isValid(productId))  return res.status(400).send("Invalid Id");
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
    if(!ObjectId.isValid(productId))  return res.status(400).send("Invalid Id");
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
