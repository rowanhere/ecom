import User from "../Models/user.model.js";

const addToWishList = async (req, res) => {
  const { ProductId } = req.body;
  const userId = req.id;
  console.log(userId,ProductId);
  await User.findOneAndUpdate({_id:userId},{
    "$set":{[`liked.${ProductId}`]:true}
  })
  res.send("Adden to wishlist");
};

export default addToWishList;
