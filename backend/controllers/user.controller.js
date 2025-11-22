import { validationResult } from "express-validator";
import userModel from "../models/user.model.js";
import * as userService from "../services/user.service.js";
import jwt from "jsonwebtoken";
import redisclient from "../services/redis.service.js";

export const createUserController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await userService.createUser(req.body);

    const token = await user.generateJWT();
    delete user._doc.password;
   
    return res.status(201).json({user, token});
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

// ===============================
// LOGIN USER
// ===============================
export const loginController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // 1) Find user
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ errors: "Invalid credentials" });
    }

    // 2) Compare password
    const isMatch = await user.isvalidpassword(password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }
    // delete user._doc.password;

    // 3) Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 4) Clean user object
    const cleanUser = user.toObject();
    delete cleanUser.password;


    return res.status(200).json({
      msg: "Login successful",
      user: cleanUser,
      token,
    });
  } catch (err) {
    console.error("Error in loginController:", err);
    return res.status(500).json({ msg: "Internal server error", error: err.message });
  }
};

// ===============================
// USER PROFILE
// ===============================
export const profileController = async (req, res) => {
  return res.status(200).json({ user: req.user });
};

// ===============================
// LOGOUT USER
// ===============================
export const logoutcontroller = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(400).json({ msg: "No token found for logout" });
    }

    const decoded = jwt.decode(token);
    const exp = decoded?.exp;

    if (exp) {
      const ttl = exp - Math.floor(Date.now() / 1000);
      await redisclient.set(token, "revoked", "EX", ttl > 0 ? ttl : 3600);
    } else {
      await redisclient.set(token, "revoked", "EX", 86400);
    }

    console.log("========= LOGOUT =========");
    console.log("Token revoked:", token);
    console.log("===========================");

    return res.status(200).json({ msg: "Logged out successfully" });
  } catch (err) {
    console.error("Error in logoutcontroller:", err);
    return res.status(500).json({ msg: "Logout failed", error: err.message });
  }
};
