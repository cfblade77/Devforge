#!/bin/bash

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate dev --name move_profile_to_gigs

# Run data migration script
echo "Running data migration script..."
node scripts/migrateProfileData.js

echo "Migration completed successfully!" 