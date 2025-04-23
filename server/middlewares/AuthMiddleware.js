import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    // ✅ Get JWT from cookie OR Authorization header
    let token = req.cookies?.jwt || req.headers.authorization?.split(" ")[1];

    if (!token) {
      console.log("No authentication token found");
      return res.status(401).json({
        error: "You are not authenticated!",
        redirectUrl: '/'
      });
    }

    // ✅ If cookie contains an object, extract the actual JWT
    if (typeof token === "object" && token.jwt) {
      token = token.jwt;
    }

    jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
      if (err) {
        console.error("JWT verification failed:", err.message);
        return res.status(403).json({
          error: "Token is not valid!",
          redirectUrl: '/'
        });
      }

      req.userId = payload?.userId;

      // Also add userId to body if not present
      if (req.body && !req.body.userId) {
        req.body.userId = payload?.userId;
        console.log("Added userId to request body:", req.body.userId);
      }

      console.log("✅ User Authenticated:", req.userId); // ✅ Debugging log
      next();
    });
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(500).json({
      error: "Authentication error",
      redirectUrl: '/'
    });
  }
};
