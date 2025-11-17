  import jwt from "jsonwebtoken";
  import redisclient from "../services/redis.service.js";


  export const authuser = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
      }

      // Must be: "Bearer <token>"
      const parts = authHeader.trim().split(" ");

      if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({ message: "Invalid token format" });
      }

      const token = parts[1].trim();

      if (!token) {
        return res.status(401).json({ message: "Token missing Unauthorized User" });
      }

  const isBlackListed = await redisclient.get(token);   // <-- FIXED

  if (isBlackListed) {
    res.cookie('token','');
    return res.status(401).send({ error: 'Unauthorized user' });  // <-- FIXED
  }



      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Token invalid or expired" });
    }
  };
