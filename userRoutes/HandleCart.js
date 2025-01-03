import User from "../Models/user.model.js";

const getCart = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.id });
    const cart = user.cart;
    if (req.method === "GET") {
      console.log(user.cart.size);
      if (cart.size === 0) {
        return res.send("Cart is empty");
      }
      return res.status(200).send(user.cart);
    }
  } catch (err) {
    console.log(err);

    res.status(500).send("Internal server error");
  }
};

const addToCart = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.id });
    const cart = user.cart;
    const { _id, id, title, thumbnail, amount } = req.body;
    if (!(_id, id && title && thumbnail && amount)) {
      return res.status(400).send("Invalid product to add on cart!");
    }
    cart.set(_id, { id, title, thumbnail, amount });
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

    getRequireProduct.amount += parseAmount;
    if (getRequireProduct.amount <= 0) {
      cart.delete(productId);
      console.log(cart);
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
export { getCart, addToCart, updateCart,deleteCart };
