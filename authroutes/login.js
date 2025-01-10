import User from "../Models/user.model.js";
import jwt from "jsonwebtoken";
import "dotenv/config";
const login = async (req, res, next) => {
  const { email, password } = req.body;
  try{
  const user = await User.findOne({$or: [{'email': email}, {'username': email}]})

  if (!user) {
    res.status(404).json({ message: "User not found!" });
    return;
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    res.status(404).json({ message: "Incorrect password" });
    return;
  }

  //generate jwt key
  const key = jwt.sign(
    { userId: user._id },
    process.env.SECRET_KEY,
    {
      expiresIn: "1w",
    }
  );  
  res.json({ message:key });
}catch(err){
   res.status(500).json({message:"Internal error!"})
}
};
export default login;
