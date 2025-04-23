import { Router } from "express";
import { getUserById, getAllFreelancers } from "../controllers/UserController.js";

export const userRoutes = Router();

userRoutes.get("/freelancers", getAllFreelancers);
userRoutes.get("/:id", getUserById); 