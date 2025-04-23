import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to add role column if it doesn't exist
async function updateDatabase() {
    try {
        // Check if column exists to avoid errors
        const columnExists = await checkColumnExists();

        if (!columnExists) {
            console.log('Adding role column to User table...');
            await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'client'`);
            console.log('Column added successfully!');
        } else {
            console.log('Role column already exists in User table');
        }

        await prisma.$disconnect();
        console.log('Database updated successfully');
    } catch (error) {
        console.error('Failed to update database:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

// Helper function to check if column exists
async function checkColumnExists() {
    try {
        const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      AND column_name = 'role'
    `;
        return result.length > 0;
    } catch (error) {
        console.error('Error checking if column exists:', error);
        return false;
    }
}

// Run the update
updateDatabase(); 