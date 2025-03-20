import { Router } from "express";
import passport from "passport";
import {
  getUserInfo,
  login,
  setUserImage,
  setUserInfo,
  signup,
  githubAuthCallback
} from "../controllers/AuthControllers.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import multer from "multer";

const authRoutes = Router();
const upload = multer({ dest: "uploads/profiles/" });

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.post("/get-user-info", verifyToken, getUserInfo);
authRoutes.post("/set-user-info", verifyToken, setUserInfo);

authRoutes.get("/github", passport.authenticate("github", { scope: ["user:email", "repo"] }));
authRoutes.get("/github/callback", passport.authenticate("github", { session: false }), githubAuthCallback);


authRoutes.post(
  "/set-user-image",
  verifyToken,
  upload.single("images"),
  setUserImage
);

export default authRoutes;
