import axios from "axios";
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
    const formData = new FormData();
    formData.append("key", "02f7298a13653f3f28dc464251fb6e6c");
    formData.append("image", getFile.buffer.toString("base64"));

    const uploadImage = await axios.post(
      "https://api.imgbb.com/1/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    const recievedImageUrl = uploadImage.data.data.url;

    await User.findByIdAndUpdate(Id, {
      picture: {
        image: recievedImageUrl,
      },
    });

    res.send("Image uploaded successfully");
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

export default uploadProfile;
