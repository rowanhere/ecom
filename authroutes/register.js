import User from "../Models/user.model.js";
import bcrypt from "bcrypt";

const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!password || password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    const user = new User({ username, email, password:hashedPassword});
  
    await user.save();
    res.json({ message: "Registration successful" });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate username error
      if (error.keyPattern.username) {
        return res.status(400).json({ message: "Username already taken." });
      }
      if (error.keyPattern.email) {
        return res.status(400).json({ message: "Email already in use." });
      }
    } else if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    // Internal server error
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default register;
