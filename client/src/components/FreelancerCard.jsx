import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FaStar, FaCode } from 'react-icons/fa';

function FreelancerCard({ freelancer }) {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/freelancer/${freelancer.id}`);
    };

    return (
        <div
            className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={handleClick}
        >
            <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                    {freelancer.avatarUrl ? (
                        <Image
                            src={freelancer.avatarUrl}
                            alt={freelancer.fullName}
                            width={60}
                            height={60}
                            className="rounded-full"
                        />
                    ) : (
                        <div className="w-[60px] h-[60px] bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-2xl text-white">
                                {freelancer.fullName?.[0]?.toUpperCase()}
                            </span>
                        </div>
                    )}
                    <div>
                        <h3 className="font-semibold text-lg">{freelancer.fullName}</h3>
                        <p className="text-gray-600">@{freelancer.username}</p>
                    </div>
                </div>

                <p className="text-gray-700 mb-4 line-clamp-2">{freelancer.description}</p>

                <div className="flex items-center gap-2 mb-4">
                    <FaCode className="text-blue-600" />
                    <div className="flex flex-wrap gap-2">
                        {freelancer.profileGig?.skills?.slice(0, 3).map((skill) => (
                            <span
                                key={skill}
                                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                            >
                                {skill}
                            </span>
                        ))}
                        {freelancer.profileGig?.skills?.length > 3 && (
                            <span className="text-gray-600 text-sm">
                                +{freelancer.profileGig.skills.length - 3} more
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <FaStar className="text-yellow-400" />
                        <span className="font-semibold">
                            ${freelancer.profileGig?.price || 50}/hr
                        </span>
                    </div>
                    <button
                        className="bg-[#1DBF73] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#19a164] transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/freelancer/${freelancer.id}`);
                        }}
                    >
                        View Profile
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FreelancerCard; 