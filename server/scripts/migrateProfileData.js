import { PrismaClient } from '@prisma/client';

/**
 * This script migrates profile data from User to ProfileGigs
 * It creates a profile gig for each freelancer user that doesn't already have one
 */
async function migrateProfileData() {
    console.log('Starting profile data migration...');
    const prisma = new PrismaClient();

    try {
        // First, check if we have the required schema fields
        let hasRequiredFields = false;
        try {
            // Try to query a gig with isProfileGig to see if the field exists
            await prisma.$queryRaw`SELECT "isProfileGig" FROM "Gigs" LIMIT 1;`;
            console.log('Required fields exist in the database schema.');
            hasRequiredFields = true;
        } catch (error) {
            console.error('Database schema is missing required fields:', error.message);
            console.error('Please apply the database migration first using the apply-profile-migration.sh script.');
            return;
        }

        if (!hasRequiredFields) {
            return;
        }

        // Find all freelancer users
        const freelancers = await prisma.user.findMany({
            where: {
                role: 'freelancer',
                isProfileInfoSet: true
            }
        });

        console.log(`Found ${freelancers.length} freelancers to migrate`);

        let created = 0;
        let skipped = 0;

        // For each freelancer, create a profile gig if they don't have one
        for (const freelancer of freelancers) {
            // Check if the user already has a profile gig
            const existingProfileGig = await prisma.gigs.findFirst({
                where: {
                    userId: freelancer.id,
                    isProfileGig: true
                }
            });

            if (existingProfileGig) {
                console.log(`User ${freelancer.id} already has a profile gig (ID: ${existingProfileGig.id})`);
                skipped++;
                continue;
            }

            // Create a new profile gig
            const profileGig = await prisma.gigs.create({
                data: {
                    title: `${freelancer.fullName || freelancer.username}'s Professional Profile`,
                    description: freelancer.description || '',
                    category: 'Development & IT',
                    deliveryTime: 1,
                    revisions: 1,
                    features: ['Professional Profile'],
                    price: 0, // Free profile
                    shortDesc: `Professional profile for ${freelancer.fullName || freelancer.username}`,
                    userId: freelancer.id,
                    images: [],
                    isProfileGig: true,
                    skills: freelancer.skills || [],
                    codingLanguages: freelancer.codingLanguages || [],
                    yearsOfExperience: freelancer.yearsOfExperience || 0,
                    certificates: freelancer.certificates || []
                }
            });

            console.log(`Created profile gig (ID: ${profileGig.id}) for user ${freelancer.id}`);
            created++;
        }

        console.log(`Migration complete: Created ${created} profile gigs, skipped ${skipped} existing ones`);
    } catch (error) {
        console.error('Error during migration:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the migration
migrateProfileData()
    .then(() => console.log('Migration script finished'))
    .catch(err => console.error('Migration script failed:', err)); 