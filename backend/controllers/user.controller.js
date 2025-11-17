import userModel from '../models/user.model.js';
import * as userService from '../services/user.service.js';
import { validationResult } from 'express-validator';
import jwt from "jsonwebtoken";
import redisclient from '../services/redis.service.js';
export const createUserController = async (req, res) => {
    
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await userService.createUser(req.body);
    const token = await user.generateJWT();
     res.status(201).json({ user, token });
  } catch (error) {
     res.status(400).send(error.message);
  }
};



export const loginController = async (req, res) => {
  // Validate Request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Find user + include password
    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ errors: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.isvalidpassword(password);
    if (!isMatch) {
      return res.status(401).json({ errors: "Invalid credentials" });
    }

    // Generate token (with ID + email)
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email
      },
      process.env.JWT_SECRET,   // 🔥 SAME SECRET used in middleware
      { expiresIn: "1d" }
    );

    // Remove password before sending user object
    const cleanUser = user.toObject();
    delete cleanUser.password;

    return res.status(200).json({
      message: "Login successful",
      user: cleanUser,
      token
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};


export const profileController=async(req,res)=>{
console.log(req.user);
res.status(200).json(
  {
   user:req.user 
  })
};

export const logoutcontroller = async(req,res)=>{
try{
  const token =req.cookies.token || req.headers.authorization.split(' ')[1];
  redisclient.set(token, 'Logout', 'EX', 60*60*24);

  res.status(200).json({
    message:'Logged out Successfully'
  })



}catch(err){
console.log(err);
res.status(400).send(err.message);
}
};