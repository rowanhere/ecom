import User from "../Models/user.model.js";

const addToWishList = async (req, res) => {
  const { ProductId } = req.body;
  const userId = req.id;
  try{
  const doc = await User.findOne({ _id: userId });
  const likedId = doc.liked;
  if (likedId.has(ProductId) && likedId.delete(ProductId)) {
    doc.liked = likedId;
    await doc.save();
    res.send("Removed from wishlist");
  console.log("userId:",userId, "ProductID:", ProductId,"(Removed from wishlist)");

    return;
  }
  likedId.set(ProductId,true)
  doc.liked = likedId
  await doc.save()
  console.log("userId:",userId, "ProductID:", ProductId,"(Added to wishlist)");
  res.send("Added to wishlist");
}catch(err){
  console.log(err);
  res.status(500).send("Internal server error!")
  
}
};

export default addToWishList;
