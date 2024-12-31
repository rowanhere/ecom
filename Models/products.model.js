import mongoose from "mongoose";
const ProductSchema = mongoose.Schema({
  category: {
    type: String,
    required: [true, "Please provide product category"],
  },
  description: {
    type: String,
    required: [true, "Please enter product description"],
  },
  discount: {
    isActive: {
      required: false,
      type: Boolean,
      default: false,
    },
    amount: {
      required: false,
      type: Number,
      default: 0,
      min: [0, "Discount amount cannot be negative"],
    },
  },
  id: {
    type: String,
    unique: true, // Ensure the id is unique
    required: [true, "Please provide product ID"],
    dropDups: true
  },
  images: {
    type: [String], // Array of strings
    validate: {
      validator: function (v) {
        return v && v.length >= 3// Ensure exactly 3 images
      },
      message: "Product must have at least 3 images",
    },
  },
  price: {
    type: Number,
    required: [true, "Please enter product price"],
  },
  rating: {
    rate: {
      type: Number,
      required: false,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      required: false,
      default: 0,
      min: 0,
    },
  },
  thumbnail: {
    type: String,
    required: [true, "Please provide product thumbnail image"],
  },
  title: {
    type: String,
    required: [true, "Please enter product name"],
  },
  type: {
    type: Object,
    required: false,
  },
});
const Product = mongoose.model("Product", ProductSchema);
export default Product;
