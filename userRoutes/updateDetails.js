import {
  encryptPassword,
  passwordValidate,
} from "../Helpers/passwordValidate.js";
import User from "../Models/user.model.js";
import * as EmailValidator from "email-validator";
const changeMail = async (req, res) => {
  const Id = req.id;
  try {
    const { email } = req.params;
    const { password } = req.body;
    const user = await User.findById(Id);
    //validation of passworrd
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) return res.status(400).send("Invalid password");

    //validation of mail
    const isEmailValid = EmailValidator.validate(email);
    if (!email || !isEmailValid)
      return res.status(400).send("Invalid Email to change");
    const prevEmail = user.email;
    //check for email
    if (email === prevEmail)
      return res.status(400).send("Cannot change email to previous mail");
    user.email = email;
    await user.save();
    //send new profile data
    const newUserProfile = {
      username: user.username,
      email: user.email,
      role: user.role,
    };
    res.status(200).json(newUserProfile);
  } catch (err) {
    console.log("UpdateDetails", err);
    res.status(500).send("Internal server error!");
  }
};

const changePassword = async (req, res) => {
  const Id = req.id;
  const { OldPassword, NewPassword } = req.body;
  if (!OldPassword || !NewPassword)
    return res.status(400).send("passwords cannot be empty");
  if (OldPassword === NewPassword)
    return res.status(400).send("New password cannot be same as old!");
  const user = await User.findById(Id);

  const validateOldPassword = await user.comparePassword(OldPassword);
  if (!validateOldPassword)
    return res.status(400).json({ message: "Old password is invalid" });

  if (!passwordValidate(NewPassword)) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters long" });
  }
  const hashedPassword = await encryptPassword(NewPassword);
  user.password = hashedPassword;
  await user.save();

  res.status(204).send();
};
export { changeMail, changePassword };
