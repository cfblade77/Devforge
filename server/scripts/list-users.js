import { PrismaClient } from '@prisma/client';

/**
 * This script lists all users in the database to help with debugging.
 */
async function listUsers() {
    console.log('=== DevForge User List ===');
    console.log('Fetching all users from the database...\n');

    const prisma = new PrismaClient();

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                fullName: true,
                role: true,
                isProfileInfoSet: true,
                gigs: {
                    where: {
                        isProfileGig: true
                    },
                    select: {
                        id: true,
                        title: true
                    }
                }
            },
            orderBy: {
                id: 'asc'
            }
        }).catch(error => {
            // If isProfileGig field doesn't exist, try without that filter
            if (error.message && error.message.includes("Unknown argument")) {
                return prisma.user.findMany({
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        fullName: true,
                        role: true,
                        isProfileInfoSet: true,
                        gigs: {
                            select: {
                                id: true,
                                title: true
                            }
                        }
                    },
                    orderBy: {
                        id: 'asc'
                    }
                });
            }
            throw error;
        });

        if (users.length === 0) {
            console.log('No users found in the database.');
            return;
        }

        console.log(`Found ${users.length} users:\n`);

        users.forEach(user => {
            console.log(`ID: ${user.id}`);
            console.log(`Username: ${user.username}`);
            console.log(`Email: ${user.email}`);
            console.log(`Full Name: ${user.fullName}`);
            console.log(`Role: ${user.role}`);
            console.log(`Profile Set: ${user.isProfileInfoSet ? 'Yes' : 'No'}`);

            if (user.gigs && user.gigs.length > 0) {
                console.log(`Gigs: ${user.gigs.length}`);
                user.gigs.forEach(gig => {
                    console.log(`  - Gig ID: ${gig.id}, Title: ${gig.title}`);
                });
            } else {
                console.log('Gigs: None');
            }

            console.log('-'.repeat(40));
        });

    } catch (error) {
        console.error('Error listing users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the listing
listUsers()
    .then(() => console.log('Listing completed.'))
    .catch(err => console.error('Listing failed:', err)); 