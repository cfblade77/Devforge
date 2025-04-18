import prisma from "../prismaClient.js";  // ✅ Corrected import
// ✅ Corrected import path

import { genSalt, hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { renameSync } from "fs";


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
      },
    });

    return res.status(201).json({
      user: { id: user.id, email: user.email },
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
          profileImage: user?.profileImage || `https://ui-avatars.com/api/?name=${user?.username || user?.email?.split('@')[0]}&background=random`
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
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
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
    };

    return res.status(200).json({ user: userResponse });
  } catch (error) {
    console.error("Error fetching user info:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


export const setUserInfo = async (req, res, next) => {
  try {
    if (req?.userId) {
      const { userName, fullName, description, skills, codingLanguages, yearsOfExperience, certificates } = req.body;

      if (userName && fullName && description) {
        const userNameValid = await prisma.user.findUnique({
          where: { username: userName },
        });
        if (userNameValid) {
          return res.status(200).json({ userNameError: true });
        }

        await prisma.user.update({
          where: { id: req.userId },
          data: {
            username: userName,
            fullName,
            description,
            skills: skills || [],
            codingLanguages: codingLanguages || [],
            yearsOfExperience: yearsOfExperience || 0,
            certificates: certificates || [],
          },
        });

        return res.status(200).send("Profile data updated successfully.");
      } else {
        return res.status(400).send("Username, Full Name, and description should be included.");
      }
    }
  } catch (err) {
    console.error("Error updating user info:", err);
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
