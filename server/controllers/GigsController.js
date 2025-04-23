import { PrismaClient } from '@prisma/client';

import { existsSync, renameSync, unlinkSync } from "fs";
import { generateGigEmbeddings, embedToPostgresVector } from '../utils/embeddings.js';

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

    // Get data from request body
    const {
      skills = [],
      codingLanguages = [],
      yearsOfExperience = 0,
      certificates = [],
      hourlyRate,
      isProfileGig = false
    } = req.body;

    prisma = new PrismaClient();

    // Generate embeddings for the gig data
    const gigData = {
      skills,
      codingLanguages,
      certificates,
      yearsOfExperience: parseInt(yearsOfExperience)
    };

    const embeddings = await generateGigEmbeddings(gigData);
    const postgresVector = embedToPostgresVector(embeddings);

    // Create gig with embeddings
    const gig = await prisma.$executeRaw`
      INSERT INTO "Gigs" (
        "userId",
        "skills",
        "codingLanguages",
        "yearsOfExperience",
        "certificates",
        "hourlyRate",
        "isProfileGig",
        "embedding"
      ) VALUES (
        ${req.userId},
        ${skills}::text[],
        ${codingLanguages}::text[],
        ${parseInt(yearsOfExperience)},
        ${certificates}::text[],
        ${hourlyRate ? parseFloat(hourlyRate) : null},
        ${isProfileGig},
        ${postgresVector}::vector
      ) RETURNING *;
    `;

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
  let prisma;
  try {
    if (req.userId) {
      prisma = new PrismaClient();

      // Get query param to determine if we should include profile gigs
      const includeProfileGigs = req.query.includeProfileGigs === 'true';

      // Check if the isProfileGig field exists in the schema
      let hasProfileGigField = false;
      try {
        // Check if column exists
        const result = await prisma.$queryRaw`
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'Gigs' 
            AND column_name = 'isProfileGig'
          );
        `;
        hasProfileGigField = result[0].exists;
      } catch (error) {
        console.warn("Could not check schema, assuming isProfileGig doesn't exist", error);
        hasProfileGigField = false;
      }

      // If the field exists and we don't want profile gigs, filter them out
      // Otherwise, return all gigs
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        include: {
          gigs: hasProfileGigField && !includeProfileGigs ? {
            where: { isProfileGig: false }
          } : true
        },
      });
      return res.status(200).json({ gigs: user?.gigs ?? [] });
    }
    return res.status(400).send("UserId should be required.");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  } finally {
    if (prisma) await prisma.$disconnect();
  }
};

export const getUserProfileGig = async (req, res, next) => {
  let prisma;
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).send("Valid user ID is required.");
    }

    prisma = new PrismaClient();

    // First verify the user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userExists) {
      return res.status(404).json({
        error: "User not found",
        message: `No user exists with ID ${userId}. Please check the userId and try again.`
      });
    }

    // First verify the schema includes isProfileGig
    try {
      // Try to query a gig with isProfileGig
      await prisma.$executeRaw`SELECT exists(SELECT 1 FROM information_schema.columns WHERE table_name='Gigs' AND column_name='isProfileGig');`;
    } catch (error) {
      console.error("Schema error:", error);
      return res.status(500).json({
        message: "Database schema is missing required fields. Please run the migration script.",
        error: error.message
      });
    }

    // Get the user's profile gig
    try {
      const profileGig = await prisma.gigs.findFirst({
        where: {
          userId: userId,
          isProfileGig: true
        },
        include: {
          createdBy: {
            select: {
              username: true,
              fullName: true,
              profileImage: true
            }
          }
        }
      });

      if (!profileGig) {
        return res.status(404).json({ message: "Profile gig not found for this user." });
      }

      return res.status(200).json({ profileGig });
    } catch (queryError) {
      console.error("Error querying profile gig:", queryError);

      // If the error is related to missing columns, give a helpful message
      if (queryError.message && queryError.message.includes("Unknown")) {
        return res.status(500).json({
          message: "Database schema is missing required fields. Please run the migration script.",
          details: queryError.message
        });
      }

      throw queryError; // Re-throw for the outer catch block
    }
  } catch (err) {
    console.error("Error fetching profile gig:", err);
    return res.status(500).send("Internal Server Error");
  } finally {
    if (prisma) await prisma.$disconnect();
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
    const { gigId } = req.params;
    const {
      skills = [],
      codingLanguages = [],
      yearsOfExperience = 0,
      certificates = [],
      hourlyRate,
      isProfileGig
    } = req.body;

    prisma = new PrismaClient();

    // Generate new embeddings for the updated gig data
    const gigData = {
      skills,
      codingLanguages,
      certificates,
      yearsOfExperience: parseInt(yearsOfExperience)
    };

    const embeddings = await generateGigEmbeddings(gigData);
    const postgresVector = embedToPostgresVector(embeddings);

    // Update gig with new embeddings using raw SQL
    const updatedGig = await prisma.$executeRaw`
      UPDATE "Gigs"
      SET 
        "skills" = ${skills}::text[],
        "codingLanguages" = ${codingLanguages}::text[],
        "yearsOfExperience" = ${parseInt(yearsOfExperience)},
        "certificates" = ${certificates}::text[],
        "hourlyRate" = ${hourlyRate ? parseFloat(hourlyRate) : null},
        "embedding" = ${postgresVector}::vector
      WHERE "id" = ${parseInt(gigId)}
      RETURNING *;
    `;

    return res.status(200).json({
      message: "Successfully updated the gig",
      gig: updatedGig
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
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
