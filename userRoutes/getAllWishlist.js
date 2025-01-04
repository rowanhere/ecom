import Product from "../Models/products.model.js";
import User from "../Models/user.model.js";

const getAllWishlist = async (req, res) => {
    try{
  const id = req.id;
  const user = await User.findById(id);
  const liked = user.liked;
  if (liked.length === 0) return res.send([]);
  const onlyKeys = [...liked.keys()];
  const getAllProduct = await Product.find({
    _id: { $in: onlyKeys },
  }).select([
    "category",
    "title",
    "_id",
    "id",
    "price",
    "discount",
    "rating",
    "thumbnail",
  ]);
  res.send(getAllProduct);
}catch(err){
    console.log(err);
    res.status(500).send("Internal server error")
    
}
};

export default getAllWishlist;
