import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import {
    getOrderTasks,
    createTask,
    updateTask,
    deleteTask
} from "../controllers/TaskController.js";

export const taskRoutes = Router();

// All routes require authentication
taskRoutes.get("/order/:orderId", verifyToken, getOrderTasks);
taskRoutes.post("/create/:orderId", verifyToken, createTask);
taskRoutes.put("/update/:taskId", verifyToken, updateTask);
taskRoutes.delete("/delete/:taskId", verifyToken, deleteTask); 