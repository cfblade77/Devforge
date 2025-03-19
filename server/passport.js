import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:8747/api/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findUnique({ where: { githubId: profile.id } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              githubId: profile.id,
              githubUsername: profile.username,
              githubAccessToken: accessToken,
              email: profile.emails?.[0]?.value || null,
              profileImage: profile.photos?.[0]?.value || null,
              isSocialLogin: true,
            },
          });
        } else {
          user = await prisma.user.update({
            where: { githubId: profile.id },
            data: { githubAccessToken: accessToken },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize and Deserialize User
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});
