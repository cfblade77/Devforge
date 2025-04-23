import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = parseInt(id);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                fullName: true,
                email: true,
                description: true,
                role: true,
                isProfileInfoSet: true,
                createdAt: true,
                // Exclude sensitive information
                password: false,
            },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate avatar URL
        const username = user.username || user.email?.split('@')[0] || 'User';
        const avatarUrl = `https://ui-avatars.com/api/?name=${username}&background=random`;

        return res.status(200).json({
            user: {
                ...user,
                avatarUrl,
            },
        });
    } catch (error) {
        console.error("Error in getUserById:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllFreelancers = async (req, res) => {
    try {
        const freelancers = await prisma.user.findMany({
            where: {
                role: 'freelancer',
                isProfileInfoSet: true,
            },
            select: {
                id: true,
                username: true,
                fullName: true,
                email: true,
                description: true,
                createdAt: true,
                gigs: {
                    where: {
                        isProfileGig: true,
                    },
                    select: {
                        id: true,
                        skills: true,
                        codingLanguages: true,
                        yearsOfExperience: true,
                        certificates: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Transform the data to include avatar URLs and flatten the gig data
        const transformedFreelancers = freelancers.map(freelancer => {
            const username = freelancer.username || freelancer.email?.split('@')[0] || 'User';
            const avatarUrl = `https://ui-avatars.com/api/?name=${username}&background=random`;

            return {
                ...freelancer,
                avatarUrl,
                profileGig: freelancer.gigs[0] || null, // Get the first (and should be only) profile gig
                gigs: undefined, // Remove the gigs array
            };
        });

        return res.status(200).json({
            freelancers: transformedFreelancers,
        });
    } catch (error) {
        console.error("Error in getAllFreelancers:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}; 