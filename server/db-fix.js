import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addCompanyColumns() {
    try {
        console.log('Adding company columns to User table...');

        // Check if columns already exist
        const columnCheck = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      AND column_name IN ('companyName', 'companyDescription', 'industry', 'companySize', 'website', 'companyLocation');
    `;

        console.log('Existing company columns:', columnCheck);

        // Add missing columns
        if (!columnCheck.find(col => col.column_name === 'companyName')) {
            await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "companyName" TEXT;`;
            console.log('Added companyName column');
        }

        if (!columnCheck.find(col => col.column_name === 'companyDescription')) {
            await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "companyDescription" TEXT;`;
            console.log('Added companyDescription column');
        }

        if (!columnCheck.find(col => col.column_name === 'industry')) {
            await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "industry" TEXT;`;
            console.log('Added industry column');
        }

        if (!columnCheck.find(col => col.column_name === 'companySize')) {
            await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "companySize" TEXT;`;
            console.log('Added companySize column');
        }

        if (!columnCheck.find(col => col.column_name === 'website')) {
            await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "website" TEXT;`;
            console.log('Added website column');
        }

        if (!columnCheck.find(col => col.column_name === 'companyLocation')) {
            await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "companyLocation" TEXT;`;
            console.log('Added companyLocation column');
        }

        // Check after adding
        const afterCheck = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      AND column_name IN ('companyName', 'companyDescription', 'industry', 'companySize', 'website', 'companyLocation');
    `;

        console.log('Company columns after update:', afterCheck);

        console.log('Successfully added company columns to User table!');
    } catch (error) {
        console.error('Error adding company columns:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addCompanyColumns()
    .then(() => console.log('Script completed'))
    .catch(error => console.error('Script failed:', error)); 