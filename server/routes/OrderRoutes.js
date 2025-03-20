import { Router } from "express";

import { verifyToken } from "../middlewares/AuthMiddleware.js";
import {
  confirmOrder,
  createOrder,
  getBuyerOrders,
  getSellerOrders,
  createGithubRepository,
  getOrderDetails
} from "../controllers/OrdersControllers.js";

export const orderRoutes = Router();

// Protected routes (require authentication)
orderRoutes.post("/create", verifyToken, createOrder);
orderRoutes.get("/get-buyer-orders", verifyToken, getBuyerOrders);
orderRoutes.get("/get-seller-orders", verifyToken, getSellerOrders);
orderRoutes.post("/create-github-repo/:orderId", verifyToken, createGithubRepository);
orderRoutes.get("/details/:orderId", verifyToken, getOrderDetails);

// Public routes (no authentication needed)
orderRoutes.put("/confirm", confirmOrder);
