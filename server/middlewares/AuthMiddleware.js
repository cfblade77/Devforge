import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    // ✅ Get JWT from cookie OR Authorization header
    let token = req.cookies?.jwt || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "You are not authenticated!" });
    }

    // ✅ If cookie contains an object, extract the actual JWT
    if (typeof token === "object" && token.jwt) {
      token = token.jwt;
    }

    jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
      if (err) {
        return res.status(403).json({ error: "Token is not valid!" });
      }
      
      req.userId = payload?.userId;
      console.log("✅ User Authenticated:", req.userId); // ✅ Debugging log
      next();
    });
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
