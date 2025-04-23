import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { HOST } from "../../utils/constants";
import Image from "next/image";
import { FaStar, FaCode, FaBriefcase, FaCertificate, FaClock } from "react-icons/fa";
import { useStateProvider } from "../../context/StateContext";

function FreelancerProfile() {
    const router = useRouter();
    const { id } = router.query;
    const [{ userInfo }] = useStateProvider();
    const [freelancer, setFreelancer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getFreelancerProfile = async () => {
            try {
                if (!id) return;

                // Get the freelancer's profile gig
                const response = await axios.get(`${HOST}/api/gigs/get-user-profile/${id}`);
                const { profileGig } = response.data;

                // Get the freelancer's user info
                const userResponse = await axios.get(`${HOST}/api/users/${id}`);
                const { user } = userResponse.data;

                setFreelancer({
                    ...user,
                    profileGig,
                });
            } catch (error) {
                console.error("Error fetching freelancer profile:", error);
            } finally {
                setLoading(false);
            }
        };

        getFreelancerProfile();
    }, [id]);

    const handleOrder = () => {
        if (!userInfo) {
            // If user is not logged in, redirect to login
            router.push("/login");
            return;
        }

        // If user is logged in, redirect to checkout with the profile gig ID
        if (freelancer?.profileGig?.id) {
            router.push(`/checkout?gigId=${freelancer.profileGig.id}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="loader"></div>
            </div>
        );
    }

    if (!freelancer) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <h2 className="text-2xl">Freelancer not found</h2>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] my-10 px-32">
            <div className="grid grid-cols-3 gap-10">
                {/* Left Column - Profile Info */}
                <div className="col-span-2">
                    <div className="flex items-center gap-8 mb-10">
                        <div className="w-32 h-32 relative">
                            {freelancer.avatarUrl ? (
                                <Image
                                    src={freelancer.avatarUrl}
                                    alt={freelancer.fullName}
                                    fill
                                    className="rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-4xl text-white">
                                        {freelancer.fullName?.[0]?.toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold mb-2">{freelancer.fullName}</h1>
                            <p className="text-xl text-gray-600">@{freelancer.username}</p>
                        </div>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-2xl font-semibold mb-4">About Me</h2>
                        <p className="text-gray-700 whitespace-pre-wrap">{freelancer.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        {/* Skills */}
                        <div className="border rounded-lg p-6">
                            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <FaCode className="text-blue-600" />
                                Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {freelancer.profileGig?.skills?.map((skill) => (
                                    <span
                                        key={skill}
                                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Coding Languages */}
                        <div className="border rounded-lg p-6">
                            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <FaBriefcase className="text-green-600" />
                                Programming Languages
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {freelancer.profileGig?.codingLanguages?.map((lang) => (
                                    <span
                                        key={lang}
                                        className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                                    >
                                        {lang}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Experience */}
                        <div className="border rounded-lg p-6">
                            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <FaClock className="text-orange-600" />
                                Experience
                            </h3>
                            <p className="text-lg">
                                {freelancer.profileGig?.yearsOfExperience} years of experience
                            </p>
                        </div>

                        {/* Certificates */}
                        <div className="border rounded-lg p-6">
                            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <FaCertificate className="text-purple-600" />
                                Certifications
                            </h3>
                            <ul className="list-disc list-inside">
                                {freelancer.profileGig?.certificates?.map((cert) => (
                                    <li key={cert} className="text-gray-700">
                                        {cert}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Right Column - Order Card */}
                <div className="col-span-1">
                    <div className="border rounded-lg p-6 sticky top-24">
                        <h3 className="text-2xl font-bold mb-4">Hire {freelancer.fullName}</h3>
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <FaStar className="text-yellow-400" />
                                <span className="font-semibold">Hourly Rate</span>
                            </div>
                            <p className="text-3xl font-bold text-[#1DBF73]">
                                ${freelancer.profileGig?.price || 50}/hr
                            </p>
                        </div>
                        <button
                            onClick={handleOrder}
                            className="w-full bg-[#1DBF73] text-white py-3 rounded-lg font-semibold hover:bg-[#19a164] transition-colors"
                        >
                            Continue to Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FreelancerProfile; 