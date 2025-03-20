import axios from 'axios';

/**
 * Creates a GitHub repository for the seller when an order is placed
 * @param {string} accessToken - GitHub access token of the seller
 * @param {object} orderInfo - Information about the order
 * @param {object} gigInfo - Information about the gig
 * @param {object} buyerInfo - Information about the buyer
 * @returns {Promise<object>} - Information about the created repository
 */
export const createGithubRepository = async (accessToken, orderInfo, gigInfo, buyerInfo) => {
    try {
        console.log("Starting GitHub repository creation for order:", orderInfo.id);

        if (!accessToken) {
            console.error("GitHub access token is missing");
            throw new Error('GitHub access token is required');
        }

        // Format repository name (using gig title and order ID)
        const rawTitle = gigInfo.title || "untitled-project";
        // Remove special characters and spaces, replace with dashes
        const safeTitle = rawTitle.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase();
        const repoName = `devforge-${safeTitle}-${orderInfo.id}`;

        console.log("Creating repository with name:", repoName);

        // Format repository description
        const repoDescription = `Repository for DevForge order #${orderInfo.id}: ${gigInfo.title} - Ordered by ${buyerInfo.username || buyerInfo.email || 'client'}`;

        console.log("GitHub API request details:", {
            repoName,
            isPrivate: true,
            buyerId: buyerInfo.id
        });

        // Create the repository
        const response = await axios.post(
            'https://api.github.com/user/repos',
            {
                name: repoName,
                description: repoDescription,
                private: true, // Make the repository private
                has_issues: true,
                has_projects: true,
                has_wiki: true,
                auto_init: true, // Initialize with README
            },
            {
                headers: {
                    'Authorization': `token ${accessToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
                timeout: 30000 // 30 second timeout
            }
        );

        console.log("GitHub repository created successfully, URL:", response.data.html_url);

        try {
            // Create initial commit with project information
            await createInitialReadme(
                accessToken,
                response.data.owner.login,
                repoName,
                orderInfo,
                gigInfo,
                buyerInfo
            );
        } catch (readmeError) {
            console.error("Failed to update README, but repo was created:", readmeError.message);
            // Continue since the repo was created successfully
        }

        return {
            repoName: repoName,
            repoUrl: response.data.html_url,
            success: true
        };
    } catch (error) {
        // Check if it's a GitHub API error with specific message
        const errorMessage = error.response?.data?.message || error.message;
        console.error('GitHub repository creation failed:', errorMessage);

        // If the repo already exists, try to retrieve it
        if (error.response?.status === 422 && errorMessage.includes('already exists')) {
            try {
                // Extract username from the error response or from user object
                const username = await getUsernameFromToken(accessToken);

                // Construct the repo URL based on the detected username and repo name
                const repoUrl = `https://github.com/${username}/${repoName}`;
                console.log("Repository already exists, returning URL:", repoUrl);

                return {
                    repoName: repoName,
                    repoUrl: repoUrl,
                    success: true,
                    message: "Repository already exists"
                };
            } catch (usernameError) {
                console.error("Failed to get username:", usernameError);
                return {
                    error: "Repository exists but couldn't retrieve details",
                    success: false
                };
            }
        }

        return {
            error: errorMessage,
            success: false
        };
    }
};

/**
 * Get GitHub username from access token
 */
const getUsernameFromToken = async (accessToken) => {
    try {
        const response = await axios.get('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${accessToken}`,
                'Accept': 'application/vnd.github.v3+json',
            },
            timeout: 10000
        });
        return response.data.login;
    } catch (error) {
        console.error("Error getting GitHub username:", error.message);
        throw error;
    }
};

/**
 * Creates an initial README.md file in the repository with project information
 */
const createInitialReadme = async (accessToken, ownerName, repoName, orderInfo, gigInfo, buyerInfo) => {
    try {
        console.log("Creating README for repository:", repoName);

        // Wait a moment for GitHub to initialize the repository
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Get the current README content and sha
        const readmeResponse = await axios.get(
            `https://api.github.com/repos/${ownerName}/${repoName}/contents/README.md`,
            {
                headers: {
                    'Authorization': `token ${accessToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
                timeout: 15000 // 15 second timeout
            }
        );

        console.log("Got existing README, creating new content");

        // Safely access properties that might be undefined
        const safeFeatures = Array.isArray(gigInfo.features) ? gigInfo.features : [];
        const safeDeliveryTime = gigInfo.deliveryTime || 'Not specified';
        const safeBuyerName = buyerInfo.username || buyerInfo.email || 'Client';

        const readmeContent = `# ${gigInfo.title || 'New Project'} (Order #${orderInfo.id})

## Project Information
- **Order Date:** ${new Date(orderInfo.createdAt).toLocaleDateString()}
- **Category:** ${gigInfo.category || 'N/A'}
- **Delivery Time:** ${safeDeliveryTime} days
- **Client:** ${safeBuyerName}

## Description
${gigInfo.description || 'No description provided.'}

## Features
${safeFeatures.length > 0
                ? safeFeatures.map(feature => `- ${feature}`).join('\n')
                : '- No features specified'}

---
Created via DevForge - Connecting developers with clients
`;

        console.log("Updating README content");

        // Update the README
        await axios.put(
            `https://api.github.com/repos/${ownerName}/${repoName}/contents/README.md`,
            {
                message: 'Update README with project information',
                content: Buffer.from(readmeContent).toString('base64'),
                sha: readmeResponse.data.sha,
            },
            {
                headers: {
                    'Authorization': `token ${accessToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
                timeout: 15000 // 15 second timeout
            }
        );

        console.log("README updated successfully");
        return true;
    } catch (error) {
        console.error('Failed to update README:', error.response?.data || error.message);
        return false;
    }
};

/**
 * Fetches commit history for a GitHub repository
 * @param {string} accessToken - GitHub access token
 * @param {string} repoName - Name of the repository
 * @param {string} ownerName - GitHub username of the repository owner
 * @returns {Promise<array>} - Array of commit information
 */
export const getGithubCommitHistory = async (accessToken, repoName, ownerName) => {
    try {
        if (!accessToken || !repoName || !ownerName) {
            console.error("Missing required parameters for fetching commit history");
            throw new Error('Required parameters missing');
        }

        const response = await axios.get(
            `https://api.github.com/repos/${ownerName}/${repoName}/commits`,
            {
                headers: {
                    'Authorization': `token ${accessToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
                timeout: 15000 // 15 second timeout
            }
        );

        // Process and format the commit data
        const commits = response.data.map(commit => ({
            sha: commit.sha,
            message: commit.commit.message,
            author: commit.commit.author.name,
            date: commit.commit.author.date,
            url: commit.html_url,
            avatar_url: commit.author?.avatar_url || null
        }));

        return {
            success: true,
            commits
        };
    } catch (error) {
        console.error('Failed to fetch commit history:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.message || error.message,
            commits: []
        };
    }
};

/**
 * Extracts repository owner and name from a GitHub URL
 * @param {string} repoUrl - Full GitHub repository URL
 * @returns {object} - Object containing owner and repo name
 */
export const extractRepoInfoFromUrl = (repoUrl) => {
    try {
        if (!repoUrl) return { owner: null, repo: null };

        // Remove trailing slash if present
        const cleanUrl = repoUrl.endsWith('/') ? repoUrl.slice(0, -1) : repoUrl;

        // Parse the URL to extract owner and repo name
        const urlParts = cleanUrl.split('/');
        const repo = urlParts.pop();
        const owner = urlParts.pop();

        return { owner, repo };
    } catch (error) {
        console.error('Failed to extract repo info from URL:', error);
        return { owner: null, repo: null };
    }
}; 