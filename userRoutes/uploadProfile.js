import User from "../Models/user.model.js";
import { Binary } from "mongodb";
const uploadProfile = async (req, res) => {
  const Id = req.id;
  try {
    const getFile = req.file;
    if (!getFile) return res.status(400).send("No file to upload!");
    if (!/image\/(png|gif|jpeg)/.test(getFile.mimetype))
      return res.status(400).send("Only images allowed!");
    const fileSize = getFile.size / (1024 * 1024); //converting kb to mb
    if (fileSize > 5) return res.status(400).send("File too large!"); //checking size in mb (max= 5mb)
    const user = await User.findByIdAndUpdate(
      Id,
      {
        picture: {
          image: getFile.buffer,
        },
      },
      { new: true }
    );

    console.log(user);

    res.send("Image uploaded successfully");
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

export default uploadProfile;
