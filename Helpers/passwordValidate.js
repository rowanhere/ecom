import PasswordValidator from "password-validator";
import bcrypt from "bcrypt";

const passwordValidate = (password) => {
    const schema = new PasswordValidator();
     schema
     .is().min(8) 
     .has().not().spaces()   
     return schema.validate(password) 
}
const encryptPassword = async(password)=>{
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword
}

export {passwordValidate,encryptPassword}