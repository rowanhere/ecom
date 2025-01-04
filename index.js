import express from "express";
import "dotenv/config";
import mongoose from "mongoose";
import cors from "cors";
import Product from "./Models/products.model.js";
import getProduct from "./Helpers/getProduct.js";
import { authRoutes } from "./authroutes/authRoutes.js";
import {userRoutes} from "./userRoutes/userRoutes.js";

const app = express();
const PORT = process.env.PORT || 4000;
const dbURI = process.env.MONGO_DB_URL;
app.use(cors());
app.use(express.json());
app.get("/", async (req, res) => {
  try {
    res.send("Connected to DB and data inserted.");
  } catch (err) {
    console.error("Error on connecting or inserting data", err);
    res.send("Error on connecting or inserting data.");
  }
});

app.post("/insertProduct", async (req, res) => {
  try {
    const sentProduct = req.body;
    await Product.insertMany(sentProduct, { ordered: false });
    res.send("Inserted", sentProduct.length, "items");
  } catch (err) {
    console.log(err.message);

    res.status(500).json({ message: "Internal server error occured" });
  }
});
app.get("/productDetail", async (req, res) => {
  const { id } = req.query;
  try {
    const getProduct = await Product.findOne({ id: id }).exec();
    res.json(getProduct);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/getProduct", getProduct, (req, res) => {
  res.status(500).json({ message: "Internal server error occured" });
});
app.get("/getRecommend", async (req, res) => {
  try {
    const getRecommendProducts = await Product.aggregate([
      { $sample: { size: 20 } },
      {
        $project: {
          category: 1,
          discount: 1,
          price: 1,
          rating: 1,
          thumbnail: 1,
          id: 1,
          title: 1,
          _id:1
        },
      },
    ]);
    // only send _id,category, discount,title, thumbnail , price and rating stats
    res.json(getRecommendProducts);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.use('/auth', authRoutes);
app.use('/user',userRoutes)
mongoose
  .connect(dbURI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error connecting to db", err);
  });
