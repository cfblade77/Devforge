import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testCompanyUpdate() {
    try {
        // Find a user to update
        const users = await prisma.user.findMany({
            take: 5,
            select: {
                id: true,
                email: true,
                username: true,
                role: true
            }
        });

        console.log('Available users:', users);

        if (users.length === 0) {
            console.log('No users found in database');
            return;
        }

        // Choose the first user
        const userId = users[0].id;

        console.log(`Testing company update for user ID: ${userId}`);

        // Update company data
        const updated = await prisma.user.update({
            where: { id: userId },
            data: {
                role: 'client',
                companyName: 'Test Company Name',
                companyDescription: 'This is a test company description',
                industry: 'Technology',
                companySize: '1-10',
                website: 'https://test-company.com',
                companyLocation: 'Test City, Test Country'
            },
            select: {
                id: true,
                username: true,
                role: true,
                companyName: true,
                companyDescription: true,
                industry: true,
                companySize: true,
                website: true,
                companyLocation: true
            }
        });

        console.log('User updated successfully with company data:');
        console.log(JSON.stringify(updated, null, 2));

        // Verify data was saved by fetching the user again
        const verified = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                role: true,
                companyName: true,
                companyDescription: true,
                industry: true,
                companySize: true,
                website: true,
                companyLocation: true
            }
        });

        console.log('Verification query result:');
        console.log(JSON.stringify(verified, null, 2));

    } catch (error) {
        console.error('Error updating company data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testCompanyUpdate()
    .then(() => console.log('Test completed'))
    .catch(error => console.error('Test failed:', error)); 