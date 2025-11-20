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

    const isBlackListed = await redisclient.get(token);
    if (isBlackListed) {
      return res.status(401).json({ error: "Unauthorized user" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // THE FIX
    req.user = {
      id: decoded.id || decoded._id,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};
