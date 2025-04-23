import { PrismaClient } from '@prisma/client';

/**
 * This script checks if a specific user exists and verifies that the database schema
 * is properly configured for the profile gig feature.
 */
async function checkUser() {
    console.log('=== DevForge User & Schema Check ===');

    // Ask for user ID to check
    const userId = process.argv[2];
    if (!userId || isNaN(parseInt(userId))) {
        console.log('Error: Please provide a valid user ID as a parameter.');
        console.log('Usage: node scripts/check-user.js USER_ID');
        console.log('Example: node scripts/check-user.js 9');
        process.exit(1);
    }

    const prisma = new PrismaClient();

    try {
        // Step 1: Check if the user exists
        console.log(`\nChecking if user with ID ${userId} exists...`);
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: {
                id: true,
                username: true,
                fullName: true,
                role: true,
                isProfileInfoSet: true,
            }
        });

        if (!user) {
            console.log(`❌ ERROR: User with ID ${userId} DOES NOT EXIST in the database.`);
            console.log('\nPossible solutions:');
            console.log('1. Check the user ID and try again');
            console.log('2. Create a new user with this ID');
            console.log('3. Use an existing user ID (try querying all users)');
            return;
        }

        console.log(`✅ User found: ${JSON.stringify(user, null, 2)}`);

        // Step 2: Check if the Gigs table has the required fields
        console.log('\nChecking if required fields exist in the Gigs table...');
        const requiredFields = [
            'isProfileGig',
            'skills',
            'codingLanguages',
            'yearsOfExperience',
            'certificates'
        ];

        let missingFields = [];

        for (const field of requiredFields) {
            try {
                // Check if field exists
                const result = await prisma.$queryRaw`
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'Gigs' 
            AND column_name = ${field}
          );
        `;

                const exists = result[0].exists;

                if (!exists) {
                    missingFields.push(field);
                }
            } catch (error) {
                console.error(`Error checking field ${field}:`, error.message);
                missingFields.push(field);
            }
        }

        if (missingFields.length === 0) {
            console.log('✅ All required fields exist in the Gigs table.');
        } else {
            console.log('❌ The following fields are missing from the Gigs table:');
            missingFields.forEach(field => console.log(`   - ${field}`));

            console.log('\nRun the migration script to add these fields:');
            console.log('$ ./scripts/apply-profile-migration.sh');
            return;
        }

        // Step 3: For freelancers, check if a profile gig exists
        if (user.role === 'freelancer') {
            console.log('\nChecking if user has a profile gig...');
            const profileGig = await prisma.gigs.findFirst({
                where: {
                    userId: parseInt(userId),
                    isProfileGig: true
                }
            });

            if (profileGig) {
                console.log(`✅ Profile gig found with ID ${profileGig.id}`);
            } else {
                console.log('❓ No profile gig found for this user.');
                console.log('This is normal if the user has not set up their profile yet.');
                console.log('A profile gig will be created when they update their profile.');
            }
        }

        console.log('\n=== Overall Status ===');
        if (missingFields.length === 0) {
            console.log('✅ Your database is correctly configured for the profile gig feature.');
            console.log('   The app should function correctly.');
        } else {
            console.log('❌ Database schema issues need to be fixed for the profile gig feature to work.');
        }

    } catch (error) {
        console.error('Error during check:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the check
checkUser()
    .then(() => console.log('\nCheck completed.'))
    .catch(err => console.error('Check failed:', err)); 