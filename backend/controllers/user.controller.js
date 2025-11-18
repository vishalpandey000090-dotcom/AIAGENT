import { validationResult } from "express-validator";
import userModel from "../models/user.model.js";
import * as userService from "../services/user.service.js";
import jwt from "jsonwebtoken";
import redisclient from "../services/redis.service.js";

export const createUserController = async (req, res) => {
  // 1) Validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Send detailed validation errors
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // 2) Create the user via service
    const user = await userService.createUser(req.body);

    // 3) Generate token (assuming generateJWT is a method on user)
    const token = await user.generateJWT();

    // 4) Return response
    return res.status(201).json({
      msg: "User created successfully",
      user: {
        id: user._id,
        email: user.email,
        // any other properties you want to send
      },
      token,
    });
  } catch (error) {
    console.error("Error in createUserController:", error);
    // If service throws a specific error, you can handle it differently
    return res.status(400).json({ msg: error.message });
  }
};

export const loginController = async (req, res) => {
  // 1) Validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // 2) Find user (with password)
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    // 3) Check password
    const isMatch = await user.isvalidpassword(password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    // 4) Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 5) Prepare clean user object
    const cleanUser = user.toObject();
    delete cleanUser.password;

    return res.status(200).json({ msg: "Login successful", user: cleanUser, token });
  } catch (err) {
    console.error("Error in loginController:", err);
    return res.status(500).json({ msg: "Internal server error", error: err.message });
  }
};

export const profileController = async (req, res) => {
  // Assuming auth middleware attaches user to req.user
  return res.status(200).json({ user: req.user });
};

export const logoutcontroller = async (req, res) => {
  try {
    // 1) Extract token — either from cookie or header
    const authHeader = req.headers.authorization;
    let token;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(400).json({ msg: "No token found for logout" });
    }

    // 2) Blacklist the token in Redis
    // Set the token as “revoked” with expiry same as token’s expiry
    // Assuming token TTL from payload or set a default TTL
    const decoded = jwt.decode(token);
    const exp = decoded?.exp;
    if (exp) {
      const ttl = exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await redisclient.set(token, "revoked", "EX", ttl);
      } else {
        // token already expired
        await redisclient.set(token, "revoked", "EX", 60 * 60); // 1 hour fallback
      }
    } else {
      // No exp in token — set a reasonable expiry
      await redisclient.set(token, "revoked", "EX", 60 * 60 * 24); // 24h
    }

    return res.status(200).json({ msg: "Logged out successfully" });
  } catch (err) {
    console.error("Error in logoutcontroller:", err);
    return res.status(500).json({ msg: "Logout failed", error: err.message });
  }
};
