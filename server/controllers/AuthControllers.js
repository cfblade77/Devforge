import prisma from "../prismaClient.js";  // ✅ Corrected import
// ✅ Corrected import path

import { genSalt, hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { renameSync } from "fs";
import { generateEmbedding, prepareGigContentForEmbedding } from "../utils/embeddingUtils.js"; // Import embedding utilities
import { generateGigEmbeddings, embedToPostgresVector } from '../utils/embeddings.js';


const generatePassword = async (password) => {
  const salt = await genSalt();
  return await hash(password, salt);
};

const maxAge = 3 * 24 * 60 * 60;
const createToken = (email, userId) => {
  // @ts-ignore
  return jwt.sign({ email, userId }, process.env.JWT_KEY, {
    expiresIn: maxAge,
  });
};

export const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send("Email and Password Required");
    }

    // ✅ Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).send("Email Already Registered");
    }

    // ✅ Create new user
    const user = await prisma.user.create({
      data: {
        email,
        password: await generatePassword(password),
        // role will default to "client" from database default
      },
    });

    // Make sure the user has the role set to 'client'
    try {
      await prisma.$executeRaw`UPDATE "User" SET "role" = 'client' WHERE "id" = ${user.id} AND ("role" IS NULL OR "role" = '')`;
    } catch (error) {
      console.log("Update role warning (non-critical):", error.message);
    }

    // Get user with role
    const userWithRole = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        role: true
      }
    });

    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        role: userWithRole?.role || "client" // Use the role from fetched user or default
      },
      jwt: createToken(email, user.id),
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (!user) {
        return res.status(404).send("User not found");
      }

      const auth = await compare(password, user.password);
      if (!auth) {
        return res.status(400).send("Invalid Password");
      }

      // Create JWT token
      const token = createToken(email, user.id);

      // Set authentication cookies with consistent settings
      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: maxAge * 1000,
        sameSite: 'lax'
      });

      res.cookie("auth_status", "authenticated", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        maxAge: maxAge * 1000,
        sameSite: 'lax'
      });

      return res.status(200).json({
        user: {
          id: user?.id,
          email: user?.email,
          username: user?.username || user?.email?.split('@')[0],
          profileImage: user?.profileImage || `https://ui-avatars.com/api/?name=${user?.username || user?.email?.split('@')[0]}&background=random`,
          role: user?.role || "client" // Include role in response, default to 'client' if not set
        },
        jwt: token,
      });
    } else {
      return res.status(400).send("Email and Password Required");
    }
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
};

export const getUserInfo = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        profileImage: true,
        username: true,
        fullName: true,
        description: true,
        isProfileInfoSet: true,
        githubUsername: true,
        githubId: true,
        isSocialLogin: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If user doesn't have a role, set it based on authentication method
    let userRole = user.role;
    if (!userRole) {
      userRole = user.isSocialLogin ? "freelancer" : "client";
      try {
        // Update the role if missing
        await prisma.$executeRaw`UPDATE "User" SET "role" = ${userRole} WHERE "id" = ${user.id}`;
      } catch (error) {
        console.log("Update role warning (non-critical):", error.message);
      }
    }

    // Prepare a consistent user object regardless of auth method
    const userResponse = {
      id: user.id,
      email: user.email,
      profileImage: user.profileImage || `https://ui-avatars.com/api/?name=${user.username || user.githubUsername || 'User'}&background=random`,
      username: user.username || user.githubUsername || `user_${user.id}`,
      fullName: user.fullName || user.username || user.githubUsername,
      description: user.description || "",
      isProfileInfoSet: user.isProfileInfoSet || user.isSocialLogin || false,
      role: userRole,
    };

    return res.status(200).json({ user: userResponse });
  } catch (error) {
    console.error("Error fetching user info:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


export const setUserInfo = async (req, res, next) => {
  try {
    const { userId } = req.body;
    console.log("setUserInfo called with userId:", userId);
    console.log("Request body:", req.body);

    if (!userId) {
      return res.status(400).send("User id is required");
    }

    const userExists = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!userExists) {
      console.log(`User with ID ${userId} not found`);
      return res.status(404).json({
        error: "User not found",
        message: `No user exists with ID ${userId}. Please check the userId and try again.`
      });
    }

    const {
      username,
      fullName,
      description,
      skills,
      codingLanguages,
      yearsOfExperience,
      certificates,
      companyName,
      companyDescription,
      industry,
      companySize,
      website,
      companyLocation,
      role,
      hourlyRate
    } = req.body;

    console.log("Processing user update with role:", role);

    // Use transaction to ensure all data is updated atomically
    const result = await prisma.$transaction(async (tx) => {
      try {
        // Step 1: Update basic user info (including description on User model)
        const updatedUserData = {
          username,
          fullName,
          description,
          isProfileInfoSet: true,
          role,
          ...(role === "client" && {
            companyName,
            companyDescription,
            industry,
            companySize,
            website,
            companyLocation,
          }),
          ...(role === "freelancer" && {
            // Convert hourlyRate to float before saving
            hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
          }),
        };

        console.log("Updating User model with:", updatedUserData);

        const updatedUser = await tx.user.update({
          where: { id: parseInt(userId) },
          data: updatedUserData,
        });

        console.log("User model updated successfully:", updatedUser);

        // Step 2: Handle freelancer-specific data (skills, languages, etc.)
        if (role === "freelancer") {
          console.log("Handling freelancer specific data (skills, languages, etc.)");
          // Find or create the profile gig for this user
          let profileGig = await tx.gigs.findFirst({
            where: {
              userId: parseInt(userId),
              isProfileGig: true,
            },
          });

          // Data for the gig record
          const freelancerGigData = {
            skills: skills || [],
            codingLanguages: codingLanguages || [],
            yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : 0,
            certificates: certificates || [],
            hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
            isProfileGig: true,
            userId: parseInt(userId),
          };

          console.log("Data prepared for Gigs update/create:", freelancerGigData);
          console.log("Raw hourlyRate from request:", req.body.hourlyRate);

          // Generate embeddings for the gig data
          console.log("Generating embeddings for gig data:", freelancerGigData);
          const embeddings = await generateGigEmbeddings(freelancerGigData);
          console.log("Generated embeddings (type:", typeof embeddings, ", isArray:", Array.isArray(embeddings), "):", Array.isArray(embeddings) ? embeddings.slice(0, 5) : embeddings);
          const vectorString = embedToPostgresVector(embeddings);
          console.log("Vector string for database (type:", typeof vectorString, "):", vectorString ? vectorString.substring(0, 100) + '...' : 'undefined');

          if (profileGig) {
            console.log("Updating existing profile gig for user:", userId);
            console.log("Attempting to store vector string (UPDATE):", vectorString ? vectorString.substring(0, 100) + '...' : 'undefined'); // Log before query
            // Update using raw SQL with proper vector casting
            await tx.$executeRawUnsafe(`
              UPDATE "Gigs"
              SET 
                "skills" = $1::text[],
                "codingLanguages" = $2::text[],
                "yearsOfExperience" = $3,
                "certificates" = $4::text[],
                "hourlyRate" = $5,
                "embedding" = $6::vector
              WHERE "id" = $7
            `,
              freelancerGigData.skills,
              freelancerGigData.codingLanguages,
              freelancerGigData.yearsOfExperience,
              freelancerGigData.certificates,
              freelancerGigData.hourlyRate,
              vectorString, // This is parameter $6
              profileGig.id
            );
          } else {
            console.log("Creating new profile gig for user:", userId);
            console.log("Attempting to store vector string (INSERT):", vectorString ? vectorString.substring(0, 100) + '...' : 'undefined'); // Log before query
            // Create using raw SQL with proper vector casting
            await tx.$executeRawUnsafe(`
              INSERT INTO "Gigs" (
                "userId", "skills", "codingLanguages", "yearsOfExperience",
                "certificates", "hourlyRate", "isProfileGig", "embedding"
              ) VALUES (
                $1, $2::text[], $3::text[], $4,
                $5::text[], $6, $7, $8::vector
              )
            `,
              freelancerGigData.userId,
              freelancerGigData.skills,
              freelancerGigData.codingLanguages,
              freelancerGigData.yearsOfExperience,
              freelancerGigData.certificates,
              freelancerGigData.hourlyRate,
              freelancerGigData.isProfileGig,
              vectorString // This is parameter $8
            );
          }
        }

        return { user: updatedUser }; // Return the updated user info
      } catch (error) {
        console.error("Error within transaction:", error);
        throw error;
      }
    });

    console.log("Transaction completed successfully, returning user:", result.user);
    return res.status(200).json({ user: result.user });

  } catch (err) {
    console.error("Error in setUserInfo controller:", err);

    // Check for specific Prisma validation errors
    if (err.code === 'P2002' && err.meta?.target?.includes('username')) {
      console.log("Username conflict detected");
      return res.status(400).json({ userNameError: true, message: "Username already exists." });
    }

    if (err.name === 'PrismaClientValidationError') {
      console.log("Prisma validation error:", err.message);
      return res.status(400).send(`Data validation error: ${err.message.split('\n').pop()}`);
    }

    return res.status(500).send("Internal Server Error");
  }
};

export const setUserImage = async (req, res, next) => {
  try {
    if (req.file) {
      if (req?.userId) {
        const date = Date.now();
        let fileName = "uploads/profiles/" + date + req.file.originalname;
        renameSync(req.file.path, fileName);


        await prisma.user.update({
          where: { id: req.userId },
          data: { profileImage: fileName },
        });
        return res.status(200).json({ img: fileName });
      }
      return res.status(400).send("Cookie Error.");
    }
    return res.status(400).send("Image not inclued.");
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Occured");
  }
};


export const githubAuthCallback = async (req, res) => {
  try {
    const { id, username, emails, photos, accessToken } = req.user;

    const email = emails && emails.length > 0 ? emails[0].value : null;
    const githubId = String(id);
    const githubUsername = username || githubId;

    // Check if a user with the same email already exists
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { githubId: githubId }, // Existing GitHub user
          { email: email }, // Email exists (possibly from password login)
        ],
      },
    });

    if (!user) {
      // ✅ Create new GitHub user if it doesn't exist
      user = await prisma.user.create({
        data: {
          githubId: githubId,
          githubUsername: githubUsername,
          githubAccessToken: accessToken,
          email: email,
          profileImage: photos?.[0]?.value || null,
          isSocialLogin: true,
          username: githubUsername, // Use GitHub username instead of ID
          isProfileInfoSet: true,
        },
      });

      // Update the role using raw SQL query
      await prisma.$executeRaw`UPDATE "User" SET "role" = 'freelancer' WHERE "id" = ${user.id}`;
    } else {
      // ✅ If user exists, update their GitHub token & profile image
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          githubAccessToken: accessToken,
          profileImage: photos?.[0]?.value || user.profileImage,
          isProfileInfoSet: true,
        },
      });

      // Update the role using raw SQL query
      await prisma.$executeRaw`UPDATE "User" SET "role" = 'freelancer' WHERE "id" = ${user.id}`;
    }

    // ✅ Create JWT token
    const token = createToken(user.email, user.id);

    // ✅ Set authentication cookies - ensure they're set correctly
    // Use samesite=lax to ensure cookies work across redirects
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: maxAge * 1000,
      sameSite: 'lax'
    });

    res.cookie("auth_status", "authenticated", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: maxAge * 1000,
      sameSite: 'lax'
    });

    console.log("GitHub auth successful for user:", user.id);
    res.redirect("http://localhost:3000/");
  } catch (error) {
    console.error("GitHub Auth Error:", error);
    res.status(500).json({ error: "GitHub authentication failed" });
  }
};

export const updateClientCompanyData = async (req, res) => {
  try {
    const { userId, companyName, companyDescription, industry, companySize, website, companyLocation } = req.body;

    console.log("updateClientCompanyData called with:", {
      userId,
      companyFields: { companyName, industry, companySize, website }
    });

    if (!userId) {
      return res.status(400).send("User ID is required");
    }

    if (!companyName) {
      return res.status(400).send("Company name is required");
    }

    const parsedUserId = parseInt(userId);

    try {
      // Try direct Prisma update first
      const updatedUser = await prisma.user.update({
        where: { id: parsedUserId },
        data: {
          companyName,
          companyDescription: companyDescription || null,
          industry: industry || null,
          companySize: companySize || null,
          website: website || null,
          companyLocation: companyLocation || null,
          role: "client", // Ensure role is set to client
          isProfileInfoSet: true
        },
        select: {
          id: true,
          username: true,
          fullName: true,
          companyName: true,
          industry: true,
          companySize: true,
          website: true
        }
      });

      console.log("Client company data updated successfully:", {
        id: updatedUser.id,
        companyName: updatedUser.companyName
      });

      return res.status(200).json({
        success: true,
        user: updatedUser
      });
    } catch (prismaError) {
      console.error("Prisma update failed, trying raw SQL:", prismaError);

      // Fallback to raw SQL if Prisma update fails
      await prisma.$executeRaw`
        UPDATE "User"
        SET 
          "companyName" = ${companyName},
          "companyDescription" = ${companyDescription || null},
          "industry" = ${industry || null},
          "companySize" = ${companySize || null},
          "website" = ${website || null},
          "companyLocation" = ${companyLocation || null},
          "role" = 'client',
          "isProfileInfoSet" = true
        WHERE "id" = ${parsedUserId}
      `;

      const updatedUser = await prisma.user.findUnique({
        where: { id: parsedUserId },
        select: {
          id: true,
          username: true,
          fullName: true,
          companyName: true,
          industry: true,
          companySize: true,
          website: true
        }
      });

      console.log("Client company data updated with SQL:", {
        id: updatedUser.id,
        companyName: updatedUser.companyName
      });

      return res.status(200).json({
        success: true,
        user: updatedUser
      });
    }
  } catch (err) {
    console.error("Error in updateClientCompanyData:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};
