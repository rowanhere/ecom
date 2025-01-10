import User from "../Models/user.model.js";

const getProfile = async (req, res) => {
  const id = req.id;

  const userProfile = await User.findById(id).select([
    "username",
    "email",
    "role",
    "-_id",
  ]);
  res.status(200).json(userProfile);
};

export default getProfile;
