# Profile Data Migration Guide

This guide explains the migration process for moving freelancer profile data from the User model to a dedicated ProfileGig.

## Background

We've made a significant change to how freelancer profile data is stored:

1. Previously, freelancer data (skills, coding languages, experience, certificates) was stored directly in the User model.
2. Now, this data is stored in a special "Profile Gig" that is automatically created when a user sets up their profile.

## Migration Process

The migration involves:

1. Schema changes (adding fields to Gigs model, marking profile gigs)
2. Data migration (creating Profile Gigs for all existing freelancers)
3. Code updates (creating/updating Profile Gigs when profiles are edited)

## How to Run the Migration

We've created a robust migration approach to safely apply these changes.

### Step 1: Prepare for Migration

Before running the migration, make sure you've:
1. Backed up your database
2. Stopped the server to prevent any writes during migration

### Step 2: Run the Migration Script

```bash
cd server
./scripts/apply-profile-migration.sh
```

This interactive script will:
1. Create a database backup (if possible)
2. Apply the schema changes directly to the database
3. Generate a new Prisma client to match the updated schema
4. Run the data migration to create profile gigs for existing freelancers

### Step 3: Restore the Code

After running the migration successfully:

1. Uncomment the profile gig related code:
   - In `controllers/AuthControllers.js`: Restore the profile gig creation logic
   - In `controllers/GigsController.js`: Uncomment the `getUserProfileGig` function
   - In `routes/GigRoutes.js`: Uncomment the profile gig route

2. Restart the server

### Step 4: Verify the Migration

You can verify the migration by:
1. Checking that Profile Gigs exist for freelancers
2. Ensuring that profile updates correctly modify both User and Gig models
3. Confirming that new freelancer profiles create a Profile Gig automatically

## Backward Compatibility

During the transition period:

1. Profile data is stored in both the User model and the Profile Gig (for backward compatibility)
2. APIs will prioritize data from Profile Gigs but fall back to User data if needed
3. In a future update, we will remove the redundant fields from the User model

## API Changes

New endpoints:
- `GET /api/gigs/get-user-profile/:userId` - Get a user's profile gig

Modified endpoints:
- `GET /api/gigs/get-user-gigs` - Now accepts `includeProfileGigs=true` query parameter to include profile gigs

## Troubleshooting

If you encounter issues during migration:

1. Check the server logs for specific error messages
2. Ensure the database schema changes were applied correctly
3. Try running the migration script with the `--verbose` flag for more detailed output:
   ```bash
   ./scripts/apply-profile-migration.sh --verbose
   ```

## Rollback

If needed, you can rollback the migration by:

1. Restoring from the database backup created during migration
2. Removing the changes from the code and re-deploying 