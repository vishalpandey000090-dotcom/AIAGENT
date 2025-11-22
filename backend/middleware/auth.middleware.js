import jwt from "jsonwebtoken";
import redisclient from "../services/redis.service.js";

export const authuser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const parts = authHeader.trim().split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const token = parts[1].trim();

    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    // -------------------------
    // CHECK IF TOKEN IS REVOKED
    // -------------------------
    const isRevoked = await redisclient.get(token);
    if (isRevoked) {
      return res.status(401).json({
        message: "jwt revoked"
      });
    }

    // -------------------------
    // JWT VERIFY
    // -------------------------
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "jwt expired" });
      }
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
