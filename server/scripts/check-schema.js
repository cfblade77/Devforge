import { PrismaClient } from '@prisma/client';

/**
 * This script checks if the database schema has the required fields
 * for the profile gig feature and provides guidance on how to fix any issues.
 */
async function checkSchema() {
    console.log('=== DevForge Schema Check ===');
    console.log('Checking database schema for profile gig feature...\n');

    const prisma = new PrismaClient();

    try {
        // Check if the Gigs table has the required fields
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
                // Check if field exists in the Gigs table
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
                missingFields.push(field); // Assume it's missing if there's an error
            }
        }

        if (missingFields.length === 0) {
            console.log('✅ SUCCESS: All required fields exist in the Gigs table.');
            console.log('The profile gig feature should work correctly.\n');
            return;
        }

        console.log('❌ ERROR: The following fields are missing from the Gigs table:');
        missingFields.forEach(field => console.log(`   - ${field}`));

        console.log('\n=== How to Fix ===');
        console.log('1. Run the script to apply the migrations:');
        console.log('   $ cd server');
        console.log('   $ ./scripts/apply-profile-migration.sh');
        console.log('\n2. If that doesn\'t work, you can manually add the missing fields:');

        let sqlCommand = 'ALTER TABLE "Gigs"';
        missingFields.forEach((field, index) => {
            if (field === 'isProfileGig') {
                sqlCommand += `\n  ADD COLUMN IF NOT EXISTS "${field}" BOOLEAN NOT NULL DEFAULT false`;
            } else if (field === 'yearsOfExperience') {
                sqlCommand += `\n  ADD COLUMN IF NOT EXISTS "${field}" INTEGER NOT NULL DEFAULT 0`;
            } else {
                sqlCommand += `\n  ADD COLUMN IF NOT EXISTS "${field}" TEXT[]`;
            }

            if (index < missingFields.length - 1) {
                sqlCommand += ',';
            }
            sqlCommand += ';';
        });

        console.log(sqlCommand);

    } catch (error) {
        console.error('Error checking schema:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the check
checkSchema()
    .then(() => console.log('Schema check completed.'))
    .catch(err => console.error('Schema check failed:', err)); 