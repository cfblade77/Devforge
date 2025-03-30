import { PrismaClient } from "@prisma/client";
import prismaClient from "../prismaClient.js";

// Get all tasks for an order
export const getOrderTasks = async (req, res) => {
    try {
        if (!req.userId || !req.params.orderId) {
            return res.status(400).json({ message: "User ID and Order ID are required." });
        }

        const prisma = prismaClient || new PrismaClient();
        const orderId = parseInt(req.params.orderId);

        // Get the order to verify permissions
        const order = await prisma.orders.findUnique({
            where: { id: orderId },
            include: {
                gig: {
                    include: {
                        createdBy: true
                    }
                },
                buyer: true
            }
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        // Verify that the logged in user is either the buyer or seller
        const isBuyer = order.buyer.id === req.userId;
        const isSeller = order.gig.createdBy.id === req.userId;

        if (!isBuyer && !isSeller) {
            return res.status(403).json({ message: "You can only view tasks for your own orders." });
        }

        // Define where clause based on user role
        let whereClause = {
            orderId: orderId
        };

        // Sellers can see all tasks, buyers can only see approved tasks or ones they created
        if (isBuyer) {
            whereClause.OR = [
                { isApproved: true },
                { createdById: req.userId }
            ];
        }

        // Get all tasks for the order
        const tasks = await prisma.task.findMany({
            where: whereClause,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        username: true,
                        profileImage: true
                    }
                },
                assignedTo: {
                    select: {
                        id: true,
                        username: true,
                        profileImage: true
                    }
                }
            }
        });

        return res.status(200).json({
            tasks,
            userRole: isSeller ? 'seller' : 'buyer'
        });
    } catch (err) {
        console.error("Error fetching tasks:", err);
        return res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
};

// Create a new task
export const createTask = async (req, res) => {
    try {
        if (!req.userId || !req.params.orderId) {
            return res.status(400).json({ message: "User ID and Order ID are required." });
        }

        const prisma = prismaClient || new PrismaClient();
        const orderId = parseInt(req.params.orderId);
        const { title, description, deadline, assignedToId } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Task title is required." });
        }

        // Get the order to verify permissions
        const order = await prisma.orders.findUnique({
            where: { id: orderId },
            include: {
                gig: {
                    include: {
                        createdBy: true
                    }
                },
                buyer: true
            }
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        // Determine if user is buyer or seller
        const isBuyer = order.buyer.id === req.userId;
        const isSeller = order.gig.createdBy.id === req.userId;

        if (!isBuyer && !isSeller) {
            return res.status(403).json({ message: "You can only create tasks for your own orders." });
        }

        // Set defaults for task creation
        const sellerId = order.gig.createdBy.id;
        const buyerId = order.buyer.id;

        // Buyers can only suggest tasks, sellers can create tasks directly
        const isSuggestion = isBuyer;
        const isApproved = isSeller; // Seller-created tasks are auto-approved

        // Default assignee is the seller
        const assignedTo = assignedToId || sellerId;

        // Create the new task
        const task = await prisma.task.create({
            data: {
                title,
                description,
                deadline: deadline ? new Date(deadline) : null,
                orderId,
                createdById: req.userId,
                assignedToId: assignedTo,
                isSuggestion,
                isApproved,
                status: "TODO"
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        username: true,
                        profileImage: true
                    }
                },
                assignedTo: {
                    select: {
                        id: true,
                        username: true,
                        profileImage: true
                    }
                }
            }
        });

        return res.status(201).json({
            message: isBuyer ? "Task suggestion created" : "Task created",
            task
        });
    } catch (err) {
        console.error("Error creating task:", err);
        return res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
};

// Update a task
export const updateTask = async (req, res) => {
    try {
        if (!req.userId || !req.params.taskId) {
            return res.status(400).json({ message: "User ID and Task ID are required." });
        }

        const prisma = prismaClient || new PrismaClient();
        const taskId = parseInt(req.params.taskId);
        const { title, description, deadline, status, assignedToId, isApproved } = req.body;

        // Get the task with order information
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: {
                order: {
                    include: {
                        gig: {
                            include: {
                                createdBy: true
                            }
                        },
                        buyer: true
                    }
                }
            }
        });

        if (!task) {
            return res.status(404).json({ message: "Task not found." });
        }

        // Verify that the logged in user is either the buyer or seller of the order
        const isBuyer = task.order.buyer.id === req.userId;
        const isSeller = task.order.gig.createdBy.id === req.userId;

        if (!isBuyer && !isSeller) {
            return res.status(403).json({ message: "You can only update tasks for your own orders." });
        }

        // Prepare data for update
        const updateData = {};

        // Seller can change anything
        if (isSeller) {
            if (title) updateData.title = title;
            if (description !== undefined) updateData.description = description;
            if (deadline) updateData.deadline = new Date(deadline);
            if (status) updateData.status = status;
            if (assignedToId) updateData.assignedToId = parseInt(assignedToId);
            if (isApproved !== undefined) updateData.isApproved = isApproved;
        }
        // Buyer can only update status if they are the assignee
        else if (isBuyer) {
            // Buyer can update status only if they are assigned to the task
            if (status && task.assignedToId === req.userId) {
                updateData.status = status;
            } else if (status) {
                return res.status(403).json({ message: "You can only update status for tasks assigned to you." });
            }

            // Buyer can suggest changes, but can't directly modify tasks
            if (title || description || deadline) {
                return res.status(403).json({ message: "As a buyer, you can only update task status. Please suggest changes via message." });
            }
        }

        // Update the task
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: updateData,
            include: {
                createdBy: {
                    select: {
                        id: true,
                        username: true,
                        profileImage: true
                    }
                },
                assignedTo: {
                    select: {
                        id: true,
                        username: true,
                        profileImage: true
                    }
                }
            }
        });

        return res.status(200).json({
            message: "Task updated successfully",
            task: updatedTask
        });
    } catch (err) {
        console.error("Error updating task:", err);
        return res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
};

// Delete a task
export const deleteTask = async (req, res) => {
    try {
        if (!req.userId || !req.params.taskId) {
            return res.status(400).json({ message: "User ID and Task ID are required." });
        }

        const prisma = prismaClient || new PrismaClient();
        const taskId = parseInt(req.params.taskId);

        // Get the task with order information
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: {
                order: {
                    include: {
                        gig: {
                            include: {
                                createdBy: true
                            }
                        }
                    }
                }
            }
        });

        if (!task) {
            return res.status(404).json({ message: "Task not found." });
        }

        // Only the seller (or task creator) can delete tasks
        const isSeller = task.order.gig.createdBy.id === req.userId;
        const isCreator = task.createdById === req.userId;

        if (!isSeller && !isCreator) {
            return res.status(403).json({ message: "Only the seller or task creator can delete tasks." });
        }

        // Delete the task
        await prisma.task.delete({
            where: { id: taskId }
        });

        return res.status(200).json({
            message: "Task deleted successfully"
        });
    } catch (err) {
        console.error("Error deleting task:", err);
        return res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
}; 