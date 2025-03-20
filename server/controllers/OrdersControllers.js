import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import { createGithubRepository as createGithubRepoFromApi, getGithubCommitHistory, extractRepoInfoFromUrl } from "../utils/githubApi.js";

const stripe = new Stripe(
  "sk_test_51DpVXWGc9EcLzRLBNKni929hB026lACv6toMfjH1FPtIXfYgIrhXzjolcYzDDl2VwtvmyPF20PJ1JaMUCTNoEwDN00FN8hrRZL"
);

export const createOrder = async (req, res, next) => {
  const prisma = new PrismaClient();
  try {
    if (!req.body.gigId) {
      return res.status(400).json({ message: "Gig ID is required." });
    }

    const { gigId } = req.body;
    console.log("Creating order for gig:", gigId, "by user:", req.userId);

    // Ensure gigId is a number and exists
    const parsedGigId = parseInt(gigId);
    if (isNaN(parsedGigId)) {
      return res.status(400).json({ message: "Invalid Gig ID format." });
    }

    // Find the gig first
    const gig = await prisma.gigs.findUnique({
      where: { id: parsedGigId },
    });

    if (!gig) {
      return res.status(404).json({ message: "Gig not found." });
    }

    // Check for ANY existing incomplete orders for this gig by this user
    console.log(`Checking for existing orders - User: ${req.userId}, Gig: ${parsedGigId}`);

    const existingIncompleteOrder = await prisma.orders.findFirst({
      where: {
        gigId: parsedGigId,
        buyerId: req.userId,
        isCompleted: false,
      },
    });

    if (existingIncompleteOrder) {
      console.log(`REUSING existing incomplete order ${existingIncompleteOrder.id} for gig ${gigId}`);

      // Create a new mock payment intent for the existing order
      const mockPaymentIntentId = `mock_pi_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
      const mockClientSecret = `${mockPaymentIntentId}_secret_${Math.random().toString(36).substring(2, 12)}`;

      // Update the existing order with the new payment intent
      await prisma.orders.update({
        where: { id: existingIncompleteOrder.id },
        data: { paymentIntent: mockPaymentIntentId }
      });

      console.log(`Updated existing order ${existingIncompleteOrder.id} with payment intent: ${mockPaymentIntentId}`);

      return res.status(200).json({
        clientSecret: mockClientSecret,
        orderId: existingIncompleteOrder.id,
        message: "Using existing order"
      });
    }

    console.log("No existing incomplete orders found, creating a new one");

    // Generate a payment intent (either real Stripe or mock)
    let paymentIntent;
    let clientSecret;

    try {
      // Try real Stripe payment intent
      paymentIntent = await stripe.paymentIntents.create({
        amount: gig.price * 100,
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
      }, {
        timeout: 10000 // 10 second timeout
      });

      clientSecret = paymentIntent.client_secret;
      console.log(`Created real Stripe payment intent: ${paymentIntent.id}`);
    } catch (stripeError) {
      console.warn("Stripe connection error, using mock payment intent:", stripeError.message);

      // Create mock payment intent
      const mockPaymentIntentId = `mock_pi_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
      const mockClientSecret = `${mockPaymentIntentId}_secret_${Math.random().toString(36).substring(2, 12)}`;

      paymentIntent = { id: mockPaymentIntentId };
      clientSecret = mockClientSecret;
      console.log(`Created mock payment intent: ${mockPaymentIntentId}`);
    }

    // Create a new order
    const newOrder = await prisma.orders.create({
      data: {
        paymentIntent: paymentIntent.id,
        price: gig.price,
        buyer: { connect: { id: req.userId } },
        gig: { connect: { id: gig.id } },
      },
    });

    console.log(`NEW ORDER created: ${newOrder.id} with payment intent: ${paymentIntent.id}`);

    return res.status(200).json({
      clientSecret: clientSecret,
      orderId: newOrder.id
    });
  } catch (err) {
    console.error("Error creating order:", err);
    return res.status(500).json({
      message: "Failed to create order",
      error: err.message
    });
  } finally {
    await prisma.$disconnect();
  }
};

export const confirmOrder = async (req, res, next) => {
  const prisma = new PrismaClient();
  try {
    if (!req.body.paymentIntent) {
      return res.status(400).json({ error: "Payment intent is required", success: false });
    }

    const paymentIntentId = req.body.paymentIntent;
    const orderId = req.body.orderId ? parseInt(req.body.orderId) : null;

    console.log("Confirming order:", {
      paymentIntent: paymentIntentId,
      orderId: orderId || "Not provided"
    });

    // Check if this is a mock payment (starts with mock_pi_)
    const isMockPayment = paymentIntentId.startsWith('mock_pi_');

    // For mock payments, extract the actual ID part before the _secret_ if present
    let actualPaymentId = paymentIntentId;
    if (isMockPayment && paymentIntentId.includes('_secret_')) {
      actualPaymentId = paymentIntentId.split('_secret_')[0];
      console.log("Using extracted mock payment ID:", actualPaymentId);
    }

    let order;

    // If we have an orderId, use it for a more precise lookup
    if (orderId) {
      // First check if order exists but isn't completed yet
      order = await prisma.orders.findUnique({
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

      if (order) {
        console.log(`Found order ${order.id} using orderId`);

        // Check if order is already completed
        if (!order.isCompleted) {
          await prisma.orders.update({
            where: { id: order.id },
            data: {
              isCompleted: true,
              paymentIntent: actualPaymentId // Update payment intent in case it changed
            }
          });
          console.log(`Marked order ${order.id} as completed`);
        } else {
          console.log(`Order ${order.id} was already marked as completed`);
        }
      } else {
        console.log(`Order with ID ${orderId} not found`);
      }
    }
    // If no orderId or order not found, try with payment intent
    else {
      try {
        console.log(`Looking up order using payment intent: ${actualPaymentId}`);

        // Try to find the order first
        const existingOrder = await prisma.orders.findUnique({
          where: { paymentIntent: actualPaymentId }
        });

        if (existingOrder) {
          if (!existingOrder.isCompleted) {
            // Mark as completed only if not already completed
            await prisma.orders.update({
              where: { paymentIntent: actualPaymentId },
              data: { isCompleted: true },
            });
            console.log(`Marked order ${existingOrder.id} as completed`);
          } else {
            console.log(`Order ${existingOrder.id} was already completed`);
          }
        } else {
          console.log(`No order found with payment intent: ${actualPaymentId}`);
        }

        // Fetch the order
        order = await prisma.orders.findUnique({
          where: { paymentIntent: actualPaymentId },
          include: {
            gig: {
              include: {
                createdBy: true
              }
            },
            buyer: true
          }
        });

        if (order) {
          console.log(`Found and updated order ${order.id} using payment intent`);
        }
      } catch (updateError) {
        console.error("Error updating order:", updateError);

        if (isMockPayment) {
          console.log("Trying alternative approach for mock payment...");

          // For mock payments, try finding the most recent order
          order = await prisma.orders.findFirst({
            where: {
              paymentIntent: {
                startsWith: 'mock_pi_'
              },
              isCompleted: false
            },
            orderBy: {
              createdAt: 'desc'
            },
            include: {
              gig: {
                include: {
                  createdBy: true
                }
              },
              buyer: true
            }
          });

          if (order) {
            console.log("Found order with mock payment:", order.id);
            // Update this specific order
            await prisma.orders.update({
              where: { id: order.id },
              data: {
                isCompleted: true,
                paymentIntent: actualPaymentId // Update with the current payment ID
              },
            });
          }
        } else {
          // For real payments, just throw the error
          throw updateError;
        }
      }
    }

    if (!order) {
      console.error("Order not found for payment intent:", actualPaymentId);
      return res.status(404).json({
        error: "Order not found",
        paymentIntent: actualPaymentId,
        orderId,
        isMockPayment,
        success: false
      });
    }

    // Refresh order data after updates
    order = await prisma.orders.findUnique({
      where: { id: order.id },
      include: {
        gig: {
          include: {
            createdBy: true
          }
        },
        buyer: true
      }
    });

    let githubRepoCreated = false;
    let githubError = null;
    let githubRepoUrl = null;

    // Force GitHub repo creation for all orders
    if (order.gig.createdBy) {
      // Only create GitHub repo if it doesn't already exist
      if (!order.githubRepoUrl) {
        // Get seller GitHub access token
        const seller = await prisma.user.findUnique({
          where: { id: order.gig.createdBy.id },
          select: {
            githubAccessToken: true,
            githubUsername: true
          }
        });

        // Create GitHub repository if seller has GitHub access token
        if (seller && seller.githubAccessToken) {
          console.log("Creating GitHub repository for order", order.id, "by seller", order.gig.createdBy.id);

          try {
            const repoResult = await createGithubRepoFromApi(
              seller.githubAccessToken,
              order,
              order.gig,
              order.buyer
            );

            if (repoResult.success) {
              // Update order with GitHub repository information
              try {
                await prisma.orders.update({
                  where: { id: order.id },
                  data: {
                    githubRepoUrl: repoResult.repoUrl,
                    githubRepoName: repoResult.repoName,
                    githubRepoCreated: true
                  }
                });
                console.log("GitHub repository information saved to order:", repoResult.repoUrl);
                githubRepoCreated = true;
                githubRepoUrl = repoResult.repoUrl;

                // Refresh order with GitHub info
                order = await prisma.orders.findUnique({
                  where: { id: order.id },
                  include: {
                    gig: {
                      include: {
                        createdBy: true
                      }
                    },
                    buyer: true
                  }
                });
              } catch (schemaError) {
                // If schema error (fields don't exist), log the repo URL but don't fail
                console.log("GitHub repository created but database schema missing fields. URL:", repoResult.repoUrl);
                githubRepoCreated = true;
                githubRepoUrl = repoResult.repoUrl;
                githubError = "Database schema issue, but repository was created.";
              }
            } else {
              console.error("Failed to create GitHub repository:", repoResult.error);
              githubError = repoResult.error;
            }
          } catch (repoError) {
            console.error("Error in GitHub repository creation:", repoError);
            githubError = repoError.message;
            // Continue processing - GitHub repo creation failure shouldn't fail the order confirmation
          }
        } else {
          console.log(`Seller ${order.gig.createdBy.id} has no GitHub access token (${seller?.githubUsername || 'no username'}). Repository not created.`);
          githubError = "Seller has not connected their GitHub account";
        }
      } else {
        console.log(`GitHub repo already exists for order ${order.id}: ${order.githubRepoUrl}`);
        githubRepoCreated = true;
        githubRepoUrl = order.githubRepoUrl;
      }
    }

    return res.status(200).json({
      success: true,
      message: "Order confirmed successfully",
      orderId: order.id,
      orderDetails: {
        title: order.gig.title,
        price: order.price,
        buyerName: order.buyer.username || order.buyer.email,
      },
      githubRepo: {
        created: githubRepoCreated,
        url: githubRepoUrl || order.githubRepoUrl || null,
        error: githubError
      }
    });
  } catch (err) {
    console.error("Error confirming order:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
      success: false
    });
  } finally {
    await prisma.$disconnect();
  }
};

export const getBuyerOrders = async (req, res, next) => {
  try {
    if (req.userId) {
      const prisma = new PrismaClient();
      const orders = await prisma.orders.findMany({
        where: { buyerId: req.userId, isCompleted: true },
        include: {
          gig: true,
          gig: {
            include: {
              createdBy: {
                select: {
                  username: true,
                  githubUsername: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return res.status(200).json({ orders });
    }
    return res.status(400).send("User id is required.");
  } catch (err) {
    console.error("Error fetching buyer orders:", err);
    return res.status(500).send("Internal Server Error");
  }
};

export const getSellerOrders = async (req, res, next) => {
  try {
    if (req.userId) {
      const prisma = new PrismaClient();
      const orders = await prisma.orders.findMany({
        where: {
          gig: {
            createdBy: {
              id: parseInt(req.userId),
            },
          },
          isCompleted: true,
        },
        include: {
          gig: true,
          buyer: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return res.status(200).json({ orders });
    }
    return res.status(400).send("User id is required.");
  } catch (err) {
    console.error("Error fetching seller orders:", err);
    return res.status(500).send("Internal Server Error");
  }
};

export const createGithubRepository = async (req, res, next) => {
  try {
    if (!req.userId || !req.params.orderId) {
      return res.status(400).json({ message: "User ID and Order ID are required." });
    }

    const prisma = new PrismaClient();

    // Get the order with all necessary related data
    const order = await prisma.orders.findUnique({
      where: { id: parseInt(req.params.orderId) },
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

    // Verify that the logged in user is the owner of the gig
    if (order.gig.createdBy.id !== req.userId) {
      return res.status(403).json({ message: "You can only create repositories for orders on your own gigs." });
    }

    // Check if GitHub repo already exists
    if (order.githubRepoUrl) {
      return res.status(400).json({ message: "GitHub repository already exists for this order." });
    }

    // Get user GitHub access token
    const seller = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        githubAccessToken: true,
        githubUsername: true
      }
    });

    if (!seller.githubAccessToken) {
      return res.status(400).json({
        message: "You need to connect your GitHub account first. Please log out and log in with GitHub."
      });
    }

    // Create the GitHub repository
    const repoResult = await createGithubRepoFromApi(
      seller.githubAccessToken,
      order,
      order.gig,
      order.buyer
    );

    if (!repoResult.success) {
      return res.status(500).json({
        message: "Failed to create GitHub repository",
        error: repoResult.error
      });
    }

    // Update order with GitHub repository information
    try {
      try {
        await prisma.orders.update({
          where: { id: order.id },
          data: {
            githubRepoUrl: repoResult.repoUrl,
            githubRepoName: repoResult.repoName,
            githubRepoCreated: true
          }
        });
        console.log("GitHub repository information saved to order:", repoResult.repoUrl);
      } catch (schemaError) {
        // If schema error (fields don't exist), log the repo URL but don't fail
        console.log("GitHub repository created but database schema missing fields. URL:", repoResult.repoUrl);
      }
    } catch (dbError) {
      console.error("Error updating order with GitHub information:", dbError);
      // Continue anyway since the repo was created
    }

    return res.status(200).json({
      message: "GitHub repository created successfully",
      repoUrl: repoResult.repoUrl,
      repoName: repoResult.repoName
    });
  } catch (err) {
    console.error("Error creating GitHub repository:", err);
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message
    });
  }
};

export const getOrderDetails = async (req, res, next) => {
  try {
    if (!req.userId || !req.params.orderId) {
      return res.status(400).json({ message: "User ID and Order ID are required." });
    }

    const prisma = new PrismaClient();
    const orderId = parseInt(req.params.orderId);

    // Get the order with all necessary related data
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
      return res.status(403).json({ message: "You can only view your own orders." });
    }

    // Default response with order details
    const response = {
      order,
      commits: []
    };

    // If there's a GitHub repo, fetch commits
    if (order.githubRepoUrl) {
      try {
        // Get the seller's GitHub access token
        const seller = await prisma.user.findUnique({
          where: { id: order.gig.createdBy.id },
          select: {
            githubAccessToken: true,
            githubUsername: true
          }
        });

        if (seller && seller.githubAccessToken) {
          // Extract repo info from URL
          const { owner, repo } = extractRepoInfoFromUrl(order.githubRepoUrl);

          if (owner && repo) {
            // Fetch commit history
            const commitHistory = await getGithubCommitHistory(
              seller.githubAccessToken,
              repo,
              owner
            );

            if (commitHistory.success) {
              response.commits = commitHistory.commits;
            }
          }
        }
      } catch (githubError) {
        console.error("Error fetching GitHub commits:", githubError);
        // Don't fail the whole request if GitHub API fails
      }
    }

    return res.status(200).json(response);
  } catch (err) {
    console.error("Error fetching order details:", err);
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message
    });
  }
};
