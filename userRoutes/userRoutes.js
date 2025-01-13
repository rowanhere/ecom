import express from "express";
import addToWishList from "./addToWishList.js";
import jwt from "jsonwebtoken";
import User from "../Models/user.model.js";
import { addToCart, deleteCart, getCart, updateCart } from "./HandleCart.js";
import getAllWishlist from "./getAllWishlist.js";
import getProfile from "./getProfile.js";
import { changeMail, changePassword } from "./updateDetails.js";
import checkSession from "../Helpers/checkSession.js";
import uploadProfile from "./uploadProfile.js";
import multer from "multer";

const checkUser = async (req, res, next) => {
  const getBearToken = req.headers.authorization?.split(" ")[1];
  if (!getBearToken) {
    res.status(400).json({ message: "Authorization token required" });
    return;
  }
  try {
    const decodeToken = jwt.verify(getBearToken, process.env.SECRET_KEY);
    const userId = decodeToken.userId;
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.id = userId;
    next();
  } catch (err) {
    console.log(err.message, "user: ", req.id);

    if (err.message === "invalid token" || err.message === "jwt expired") {
      return res.status(400).send("Please log in");
    }
    res.status(500).json({ message: "Internal server error" });
  }
};
const router = express.Router();
router.use(checkUser);
router.get("/wishlist/:ProductId", async (req, res) => {
  try {
    const userId = req.id;
    const ProductId = req.params.ProductId;
    const user = await User.findOne({ _id: userId }, { liked: 1, _id: 0 });
    if (user.liked.has(ProductId)) {
      return res.send(true);
    }
    res.send(false);
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});
router.get("/wishlist", getAllWishlist);
router.post("/wishlist", addToWishList);
router.get("/cart", getCart);
router.post("/cart", addToCart);
router.patch("/cart/:id", updateCart);
router.delete("/cart/:id", deleteCart);
router.get("/profile", getProfile);
router.post("/changemail/:email", changeMail);
router.post("/changepassword", changePassword);
router.get("/session", checkSession);
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({
  storage: storage,
});
router.post("/uploadprofile", upload.single("file"), uploadProfile);

export { router as userRoutes };
