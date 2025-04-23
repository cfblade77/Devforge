# DevForge Server

This is the server component of the DevForge application.

## Recent Changes: Profile Gig Migration

We've recently made a significant change to how freelancer profiles are stored. Freelancer profile data (skills, coding languages, experience, certificates) is now stored in a special Profile Gig rather than directly in the User model.

### Important Notes

1. **Current Status**: The code has been updated to support the profile gig feature, but you need to ensure your database has the required schema changes.

2. **Before Running the Server**: You need to check if your database schema is compatible and apply migrations if needed.

3. **Migration Steps**:
   - Check if migration is needed: `npm run check-schema`
   - If needed, run the migration script: `./scripts/apply-profile-migration.sh`
   - Alternatively, apply SQL changes directly: `psql -U your_user -d your_db -f scripts/apply-migration.sql`
   - Restart the server

## Quick Start

1. Check your database schema:
   ```
   npm run check-schema
   ```

2. Apply migrations if needed:
   ```
   ./scripts/apply-profile-migration.sh
   ```

3. Start the server:
   ```
   npm run dev
   ```

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the database connection string and other settings

3. Apply database migrations:
   ```
   npx prisma migrate dev
   ```

4. Generate Prisma client:
   ```
   npx prisma generate
   ```

5. Start the server:
   ```
   npm run dev
   ```

## API Documentation

The API documentation can be found in the `/docs` folder.

## Database Schema

The database schema is defined in the Prisma schema file: `prisma/schema.prisma`.

## Scripts

- `npm run dev`: Start the development server
- `npm start`: Start the production server
- `npm run migrate-profile-data`: Run the profile data migration script
- `npm run check-schema`: Check if your database schema has the required fields
- `npm run check-user ID`: Check if a specific user exists and has a profile gig
- `npm run list-users`: List all users in the database (useful for debugging)

## Diagnostic Tools

We've added several diagnostic tools to help with debugging and fixing issues:

- **check-schema.js**: Verifies if the database schema has the required fields for profile gigs
- **check-user.js**: Checks if a specific user exists and if they have a profile gig
- **list-users.js**: Lists all users in the database (useful for finding valid user IDs)
- **apply-migration.sql**: Direct SQL script to add required fields to the database

### Common Errors

1. **"Record to update not found"**: The user ID doesn't exist in the database.
   - Fix: Use `npm run list-users` to see valid user IDs.
   - Fix: Use `npm run check-user ID` to check if a specific user exists.

2. **"Unknown argument 'isProfileGig'"**: The database schema doesn't have the required fields.
   - Fix: Run `./scripts/apply-profile-migration.sh` to update the schema.
   - Fix: Or apply the SQL directly: `psql -U your_user -d your_db -f scripts/apply-migration.sql`

## Troubleshooting

If you're having issues with the profile gig feature:

1. Run `npm run check-schema` to verify your database schema
2. If fields are missing, run the migration script
3. If you're encountering user-related errors, run `npm run list-users` to see valid user IDs
4. For specific user issues, run `npm run check-user ID` with the problematic user ID
5. Check the server logs for specific error messages

## Contributing

Please see the [CONTRIBUTING.md](./CONTRIBUTING.md) file for guidelines. 