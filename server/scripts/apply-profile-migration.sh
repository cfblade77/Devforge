#!/bin/bash

echo "=== Profile Migration Helper ==="
echo "This script will help apply the profile gig migration safely."
echo ""

# Step 0: Check current schema first to see if migration is needed
echo "Step 0: Checking current schema..."
node scripts/check-schema.js

read -p "Continue with the migration? (y/n): " CONTINUE_MIGRATION
if [ "$CONTINUE_MIGRATION" != "y" ]; then
  echo "Migration aborted."
  exit 0
fi

echo ""

# Step 1: Create a backup if possible
echo "Step 1: Attempting to create a database backup..."
if [ -z "$DATABASE_URL" ]; then
  echo "WARNING: DATABASE_URL environment variable not set, skipping backup."
else
  echo "Please provide the PostgreSQL credentials:"
  read -p "Database name: " DB_NAME
  read -p "Username: " DB_USER
  BACKUP_FILE="devforge_db_backup_$(date +%Y%m%d_%H%M%S).sql"
  
  echo "Creating backup to $BACKUP_FILE..."
  pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null
  
  if [ $? -eq 0 ]; then
    echo "Backup created successfully!"
  else
    echo "WARNING: Backup creation failed. Do you want to continue? (y/n)"
    read CONTINUE
    if [ "$CONTINUE" != "y" ]; then
      echo "Migration aborted."
      exit 1
    fi
  fi
fi

# Step 2: Apply database changes manually
echo ""
echo "Step 2: Applying database changes manually..."
echo "Connecting to database..."

read -p "Do you want to apply the database schema changes now? (y/n): " APPLY_SCHEMA
if [ "$APPLY_SCHEMA" = "y" ]; then
  # Apply the migration using psql
  read -p "Database name: " DB_NAME
  read -p "Username: " DB_USER
  
  echo "Applying database changes..."
  psql -U "$DB_USER" -d "$DB_NAME" -c "
  -- Add new fields to Gigs table
  ALTER TABLE \"Gigs\" ADD COLUMN IF NOT EXISTS \"isProfileGig\" BOOLEAN NOT NULL DEFAULT false;
  ALTER TABLE \"Gigs\" ADD COLUMN IF NOT EXISTS \"skills\" TEXT[];
  ALTER TABLE \"Gigs\" ADD COLUMN IF NOT EXISTS \"codingLanguages\" TEXT[];
  ALTER TABLE \"Gigs\" ADD COLUMN IF NOT EXISTS \"yearsOfExperience\" INTEGER NOT NULL DEFAULT 0;
  ALTER TABLE \"Gigs\" ADD COLUMN IF NOT EXISTS \"certificates\" TEXT[];
  "
  
  if [ $? -eq 0 ]; then
    echo "Database schema updated successfully!"
  else
    echo "ERROR: Database schema update failed."
    exit 1
  fi
else
  echo "Skipping database schema changes."
fi

# Step 3: Update Prisma client
echo ""
echo "Step 3: Generating updated Prisma client..."
npx prisma generate

if [ $? -eq 0 ]; then
  echo "Prisma client updated successfully!"
else
  echo "WARNING: Prisma client update failed."
fi

# Step 4: Run data migration script
echo ""
echo "Step 4: Running data migration script..."
read -p "Do you want to run the data migration script to create profile gigs? (y/n): " RUN_MIGRATION
if [ "$RUN_MIGRATION" = "y" ]; then
  node scripts/migrateProfileData.js
  
  if [ $? -eq 0 ]; then
    echo "Data migration completed!"
  else
    echo "ERROR: Data migration failed."
    exit 1
  fi
else
  echo "Skipping data migration."
fi

# Step 5: Verify changes
echo ""
echo "Step 5: Verifying database schema changes..."
node scripts/check-schema.js

echo ""
echo "=== Migration Process Completed ==="
echo "Next steps:"
echo "1. Restore the commented code in controllers and routes"
echo "2. Restart the server to apply changes" 