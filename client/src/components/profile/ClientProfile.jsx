import { useStateProvider } from "../../context/StateContext";
import { reducerCases } from "../../context/constants";
import { SET_USER_INFO } from "../../utils/constants";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { FaCode } from "react-icons/fa";
import { BsBuilding } from "react-icons/bs";

function ClientProfile({ userInfo }) {
    const router = useRouter();
    const [, dispatch] = useStateProvider();
    const [errorMessage, setErrorMessage] = useState("");

    // Client data state
    const [clientData, setClientData] = useState({
        userName: "",
        fullName: "",
        description: "",
        companyName: "",
        companyDescription: "",
        industry: "",
        companySize: "",
        website: "",
        companyLocation: "",
    });

    useEffect(() => {
        if (userInfo) {
            // Set client data
            setClientData({
                userName: userInfo?.username || "",
                fullName: userInfo?.fullName || "",
                description: userInfo?.description || "",
                companyName: userInfo?.companyName || "",
                companyDescription: userInfo?.companyDescription || "",
                industry: userInfo?.industry || "",
                companySize: userInfo?.companySize || "",
                website: userInfo?.website || "",
                companyLocation: userInfo?.companyLocation || "",
            });
        }
    }, [userInfo]);

    const handleChange = (e) => {
        setClientData({ ...clientData, [e.target.name]: e.target.value });
    };

    const setProfile = async () => {
        // Validate required fields
        if (!clientData.userName || !clientData.fullName || !clientData.description) {
            setErrorMessage("Username, Full Name, and Description are required fields");
            return;
        }

        // Additional validation for client
        if (!clientData.companyName) {
            setErrorMessage("Company Name is required for client profiles");
            return;
        }

        try {
            const response = await axios.post(
                SET_USER_INFO,
                { ...clientData },
                { withCredentials: true }
            );
            if (response.data.userNameError) {
                setErrorMessage("Enter a Unique Username");
            } else {
                // Update the global user state
                dispatch({
                    type: reducerCases.SET_USER,
                    userInfo: {
                        ...userInfo,
                        ...clientData,
                    },
                });

                router.push("/");
            }
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data) {
                setErrorMessage(err.response.data);
            } else {
                setErrorMessage("An error occurred while saving your profile");
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-[80vh] gap-8 py-8 px-4 max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-4">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Client Profile</h2>
                <p className="text-gray-600">Complete your client profile to help us connect you with the right freelancers</p>
                {errorMessage && (
                    <div className="mt-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
                        <p>{errorMessage}</p>
                    </div>
                )}
            </div>

            {/* Main Form */}
            <div className="w-full bg-white shadow-lg rounded-xl p-8 border border-gray-200">
                <div className="mb-10">
                    <h3 className="text-xl font-semibold mb-6 text-gray-700 border-b pb-2">
                        <div className="flex items-center gap-2">
                            <FaCode className="text-blue-600" />
                            <span>Personal Information</span>
                        </div>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="userName">
                                Username *
                            </label>
                            <input
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                type="text"
                                name="userName"
                                id="userName"
                                placeholder="Choose a unique username"
                                value={clientData.userName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="fullName">
                                Full Name *
                            </label>
                            <input
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                type="text"
                                name="fullName"
                                id="fullName"
                                placeholder="Your full name"
                                value={clientData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block text-gray-700 font-medium mb-2" htmlFor="description">
                            Bio *
                        </label>
                        <textarea
                            name="description"
                            id="description"
                            value={clientData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
                            placeholder="Tell us about yourself"
                            required
                        ></textarea>
                    </div>
                </div>

                <div className="mt-10">
                    <h3 className="text-xl font-semibold mb-6 text-gray-700 border-b pb-2">
                        <div className="flex items-center gap-2">
                            <BsBuilding className="text-blue-600" />
                            <span>Company Information</span>
                        </div>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="companyName">
                                Company Name *
                            </label>
                            <input
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                type="text"
                                name="companyName"
                                id="companyName"
                                placeholder="Your company name"
                                value={clientData.companyName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="industry">
                                Industry
                            </label>
                            <input
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                type="text"
                                name="industry"
                                id="industry"
                                placeholder="Technology, Healthcare, Education, etc."
                                value={clientData.industry}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="companySize">
                                Company Size
                            </label>
                            <select
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                name="companySize"
                                id="companySize"
                                value={clientData.companySize}
                                onChange={handleChange}
                            >
                                <option value="">Select company size</option>
                                <option value="1-10">1-10 employees</option>
                                <option value="11-50">11-50 employees</option>
                                <option value="51-200">51-200 employees</option>
                                <option value="201-500">201-500 employees</option>
                                <option value="501-1000">501-1000 employees</option>
                                <option value="1000+">1000+ employees</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="website">
                                Company Website
                            </label>
                            <input
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                type="url"
                                name="website"
                                id="website"
                                placeholder="https://example.com"
                                value={clientData.website}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="companyDescription">
                                Company Description
                            </label>
                            <textarea
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
                                name="companyDescription"
                                id="companyDescription"
                                placeholder="Tell us about your company, its mission, and what you do"
                                value={clientData.companyDescription}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="companyLocation">
                                Company Location
                            </label>
                            <input
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                type="text"
                                name="companyLocation"
                                id="companyLocation"
                                placeholder="City, Country"
                                value={clientData.companyLocation}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="mt-10 flex justify-center">
                    <button
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 py-3 rounded-lg shadow-lg transform transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        type="button"
                        onClick={setProfile}
                    >
                        Save Profile
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ClientProfile; 