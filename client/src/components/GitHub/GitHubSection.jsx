import React from 'react';
import { FaGithub } from 'react-icons/fa';

/**
 * GitHub section component for displaying repository and commits
 */
const GitHubSection = ({ order, commits, isUserSeller, handleCreateRepo, isCreatingRepo, repoError }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* GitHub Repository Section */}
            <div className="lg:col-span-2 bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">GitHub Repository</h2>

                <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-2">Repository Details</h3>
                    {order.githubRepoUrl ? (
                        <div>
                            <a
                                href={order.githubRepoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                            >
                                <FaGithub className="mr-2" /> View Repository
                            </a>
                            <p className="mt-2 text-sm text-gray-600">
                                Repository URL: <a href={order.githubRepoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{order.githubRepoUrl}</a>
                            </p>
                        </div>
                    ) : (
                        <div>
                            {isUserSeller ? (
                                <>
                                    <button
                                        onClick={handleCreateRepo}
                                        disabled={isCreatingRepo}
                                        className="inline-flex items-center bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors disabled:bg-gray-400"
                                    >
                                        <FaGithub className="mr-2" />
                                        {isCreatingRepo ? "Creating..." : "Create Repository"}
                                    </button>
                                    {repoError && (
                                        <div className="mt-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
                                            <p className="font-medium">Error creating repository:</p>
                                            <p>{repoError}</p>
                                            <p className="mt-2 text-xs">
                                                Make sure you've connected your GitHub account. If you haven't, please log out and log in with GitHub.
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-gray-500">GitHub repository not available for this order</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Commits History Section */}
            <div className="lg:col-span-1 bg-white shadow-md rounded-lg p-6 h-fit">
                <h2 className="text-2xl font-semibold mb-4">Commits History</h2>

                {commits && commits.length > 0 ? (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {commits.map((commit) => (
                            <div key={commit.sha} className="border-b pb-3">
                                <div className="flex items-start mb-1">
                                    {commit.avatar_url && (
                                        <img
                                            src={commit.avatar_url}
                                            alt={commit.author}
                                            className="w-8 h-8 rounded-full mr-2"
                                        />
                                    )}
                                    <div>
                                        <p className="font-medium">{commit.author}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(commit.date).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <p className="mt-1 text-gray-700">{commit.message}</p>
                                <a
                                    href={commit.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 text-sm hover:underline mt-1 inline-block"
                                >
                                    View commit
                                </a>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">
                        {order.githubRepoUrl
                            ? "No commits available for this repository yet. Commits will appear here after code is pushed."
                            : "Create a GitHub repository to track commits"}
                    </p>
                )}
            </div>
        </div>
    );
};

export default GitHubSection; 