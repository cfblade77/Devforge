import { PrismaClient } from '@prisma/client';

import { existsSync, renameSync, unlinkSync } from "fs";

export const addGig = async (req, res, next) => {

  let prisma;
  try {
    if (!req.files || !req.files.length) {
      return res.status(400).json({ message: "Please upload at least one image" });
    }

    // Handle file uploads
    const fileNames = req.files.map(file => {
      const date = Date.now();
      const newFileName = date + file.originalname;
      renameSync(file.path, "uploads/" + newFileName);
      return newFileName;
    });

    // Get data from request body instead of query  
    const {
      title,
      description,
      category,
      features,
      price,
      revisions,
      time,
      shortDesc,
    } = req.body;

    console.log("Received gig data:", {
      title,
      description,
      category,
      features,
      price,
      revisions,
      time,
      shortDesc,
    });

    // Validate required fields
    if (!title || !description || !category || !features || !price ||
      !revisions || !time || !shortDesc) {
      return res.status(400).json({ message: "All fields are required" });
    }

    prisma = new PrismaClient();

    // Parse features from JSON string
    const parsedFeatures = JSON.parse(features);

    const gig = await prisma.gigs.create({
      data: {
        title,
        description,
        deliveryTime: parseInt(time),
        category,
        features: parsedFeatures,
        price: parseInt(price),
        shortDesc,
        revisions: parseInt(revisions),
        createdBy: { connect: { id: req.userId } },
        images: fileNames,
      },
    });

    return res.status(201).json({
      message: "Successfully created the gig.",
      gig
    });

  } catch (err) {
    console.error("Error creating gig:", err);
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message
    });
  } finally {
    if (prisma) await prisma.$disconnect();
  }
};

export const getUserAuthGigs = async (req, res, next) => {
  try {
    if (req.userId) {
      const prisma = new PrismaClient();
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        include: { gigs: true },
      });
      return res.status(200).json({ gigs: user?.gigs ?? [] });
    }
    return res.status(400).send("UserId should be required.");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

export const getGigData = async (req, res, next) => {
  try {
    if (req.params.gigId) {
      const prisma = new PrismaClient();
      const gig = await prisma.gigs.findUnique({
        where: { id: parseInt(req.params.gigId) },
        include: {
          reviews: {
            include: {
              reviewer: true,
            },
          },
          createdBy: true,
        },
      });

      const userWithGigs = await prisma.user.findUnique({
        where: { id: gig?.createdBy.id },
        include: {
          gigs: {
            include: { reviews: true },
          },
        },
      });

      const totalReviews = userWithGigs.gigs.reduce(
        (acc, gig) => acc + gig.reviews.length,
        0
      );

      const averageRating = (
        userWithGigs.gigs.reduce(
          (acc, gig) =>
            acc + gig.reviews.reduce((sum, review) => sum + review.rating, 0),
          0
        ) / totalReviews
      ).toFixed(1);

      return res
        .status(200)
        .json({ gig: { ...gig, totalReviews, averageRating } });
    }
    return res.status(400).send("GigId should be required.");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

export const editGig = async (req, res, next) => {
  let prisma;
  try {
    if (!req.files || !req.files.length) {
      return res.status(400).json({ message: "Please upload at least one image" });
    }

    // Handle file uploads
    const fileNames = req.files.map(file => {
      const date = Date.now();
      const newFileName = date + file.originalname;
      renameSync(file.path, "uploads/" + newFileName);
      return newFileName;
    });

    // Get data from request body
    const {
      title,
      description,
      category,
      features,
      price,
      revisions,
      time,
      shortDesc,
    } = req.body;

    console.log("Received gig edit data:", {
      title,
      description,
      category,
      features,
      price,
      revisions,
      time,
      shortDesc,
    });

    // Validate required fields
    if (!title || !description || !category || !features || !price ||
      !revisions || !time || !shortDesc) {
      return res.status(400).json({ message: "All fields are required" });
    }

    prisma = new PrismaClient();

    // Get old data to clean up images
    const oldData = await prisma.gigs.findUnique({
      where: { id: parseInt(req.params.gigId) },
    });

    if (!oldData) {
      return res.status(404).json({ message: "Gig not found" });
    }

    // Check if user is the owner of the gig
    if (oldData.userId !== req.userId) {
      return res.status(403).json({ message: "You can only edit your own gigs" });
    }

    // Parse features from JSON string if it's a string
    let parsedFeatures;
    try {
      parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
    } catch (e) {
      return res.status(400).json({ message: "Invalid features format" });
    }

    // Update the gig
    const updatedGig = await prisma.gigs.update({
      where: { id: parseInt(req.params.gigId) },
      data: {
        title,
        description,
        deliveryTime: parseInt(time),
        category,
        features: parsedFeatures,
        price: parseInt(price),
        shortDesc,
        revisions: parseInt(revisions),
        images: fileNames,
      },
    });

    // Clean up old images
    oldData.images.forEach((image) => {
      try {
        if (existsSync(`uploads/${image}`)) {
          unlinkSync(`uploads/${image}`);
        }
      } catch (err) {
        console.error(`Failed to delete image ${image}:`, err);
      }
    });

    return res.status(201).json({
      message: "Successfully updated the gig.",
      gig: updatedGig
    });
  } catch (err) {
    console.error("Error updating gig:", err);
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message
    });
  } finally {
    if (prisma) await prisma.$disconnect();
  }
};

export const searchGigs = async (req, res, next) => {
  try {
    if (req.query.searchTerm || req.query.category) {
      const prisma = new PrismaClient();
      const gigs = await prisma.gigs.findMany(
        createSearchQuery(req.query.searchTerm, req.query.category)
      );
      return res.status(200).json({ gigs });
    }
    return res.status(400).send("Search Term or Category is required.");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

const createSearchQuery = (searchTerm, category) => {
  const query = {
    where: {
      OR: [],
    },
    include: {
      reviews: {
        include: {
          reviewer: true,
        },
      },
      createdBy: true,
    },
  };
  if (searchTerm) {
    query.where.OR.push({
      title: { contains: searchTerm, mode: "insensitive" },
    });
  }
  if (category) {
    query.where.OR.push({
      category: { contains: category, mode: "insensitive" },
    });
  }
  return query;
};

const checkOrder = async (userId, gigId) => {
  try {
    const prisma = new PrismaClient();
    const hasUserOrderedGig = await prisma.orders.findFirst({
      where: {
        buyerId: parseInt(userId),
        gigId: parseInt(gigId),
        isCompleted: true,
      },
    });
    return hasUserOrderedGig;
  } catch (err) {
    console.log(err);
  }
};

export const checkGigOrder = async (req, res, next) => {
  try {
    if (req.userId && req.params.gigId) {
      const hasUserOrderedGig = await checkOrder(req.userId, req.params.gigId);
      return res
        .status(200)
        .json({ hasUserOrderedGig: hasUserOrderedGig ? true : false });
    }
    return res.status(400).send("userId and gigId is required.");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

export const addReview = async (req, res, next) => {
  try {
    if (req.userId && req.params.gigId) {
      if (await checkOrder(req.userId, req.params.gigId)) {
        if (req.body.reviewText && req.body.rating) {
          const prisma = new PrismaClient();
          const newReview = await prisma.reviews.create({
            data: {
              rating: req.body.rating,
              reviewText: req.body.reviewText,
              reviewer: { connect: { id: parseInt(req?.userId) } },
              gig: { connect: { id: parseInt(req.params.gigId) } },
            },
            include: {
              reviewer: true,
            },
          });
          return res.status(201).json({ newReview });
        }
        return res.status(400).send("ReviewText and Rating are required.");
      }
      return res
        .status(400)
        .send("You need to purchase the gig in order to add review.");
    }
    return res.status(400).send("userId and gigId is required.");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};
