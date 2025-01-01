import express from "express";
import addToWishList from "./addToWishList.js";
import jwt from "jsonwebtoken";
import User from "../Models/user.model.js";

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
      res.status(404).json({ message: "User not found" });
      return;
    }
     req.id = userId
     next()
  } catch (err) {
    console.log(err);
    
    if (err.message === "invalid token") {
      res.status(400).json({ message: "Authorization token invalid" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};
const router = express.Router();
router.use(checkUser);
router.post("/wishlist", addToWishList);

export { router as userRoutes };
