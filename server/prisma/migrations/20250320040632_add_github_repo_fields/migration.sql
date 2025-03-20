-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "githubRepoCreated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "githubRepoName" TEXT,
ADD COLUMN     "githubRepoUrl" TEXT;
