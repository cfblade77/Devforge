import { useStateProvider } from "../../context/StateContext";
import { reducerCases } from "../../context/constants";
import { HOST, SET_USER_INFO } from "../../utils/constants";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState, useRef } from "react";
import { RiRobot2Fill } from "react-icons/ri";
import { FaTimes, FaPaperPlane, FaBriefcase, FaCode } from "react-icons/fa";

function FreelancerProfile({ userInfo }) {
    const router = useRouter();
    const [, dispatch] = useStateProvider();
    const [errorMessage, setErrorMessage] = useState("");

    // Freelancer data state
    const [freelancerData, setFreelancerData] = useState({
        userName: "",
        fullName: "",
        description: "",
        skills: [],
        codingLanguages: [],
        yearsOfExperience: 0,
        certificates: [],
        hourlyRate: 0,
    });

    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const [isChatOpen, setIsChatOpen] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (userInfo) {
            // Set freelancer data
            setFreelancerData({
                userName: userInfo?.username || "",
                fullName: userInfo?.fullName || "",
                description: userInfo?.description || "",
                skills: userInfo?.skills || [],
                codingLanguages: userInfo?.codingLanguages || [],
                yearsOfExperience: userInfo?.yearsOfExperience || 0,
                certificates: userInfo?.certificates || [],
                hourlyRate: userInfo?.hourlyRate || 50,
            });
        }
    }, [userInfo]);

    useEffect(() => {
        // Scroll to bottom of chat when new messages are added
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatMessages]);

    useEffect(() => {
        // Initialize chat session when component mounts
        const initChatSession = async () => {
            try {
                await axios.get('/api/chat', { withCredentials: true });
                console.log('Chat session initialized');
                // Add welcome message
                setChatMessages([{
                    sender: "bot",
                    text: "Hi there! I'm your DevForge assistant. I can help you complete your freelancer profile. Let me know what you need help with!"
                }]);
            } catch (err) {
                console.error('Failed to initialize chat session:', err);
            }
        };

        initChatSession();
    }, []);

    const handleChange = (e) => {
        setFreelancerData({ ...freelancerData, [e.target.name]: e.target.value });
    };

    const setProfile = async () => {
        // Validate required fields
        if (!freelancerData.userName || !freelancerData.fullName || !freelancerData.description) {
            setErrorMessage("Username, Full Name, and Description are required fields");
            return;
        }

        try {
            const response = await axios.post(
                SET_USER_INFO,
                { ...freelancerData },
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
                        ...freelancerData,
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

    const handleChatSubmit = async (e) => {
        e?.preventDefault();
        if (chatInput.trim() === "") return;

        // Add user message to chat
        setChatMessages((prev) => [...prev, { sender: "user", text: chatInput }]);

        // Add loading message
        const loadingMsgIndex = chatMessages.length;
        setChatMessages((prev) => [...prev, { sender: "bot", text: "Thinking...", isLoading: true }]);

        try {
            // Send message to chatbot backend
            const response = await axios.post("/api/chat", {
                message: chatInput
            }, { withCredentials: true });

            // Replace loading message with actual response
            setChatMessages(prev => {
                const updated = [...prev];
                updated[loadingMsgIndex] = { sender: "bot", text: response.data.response };
                return updated;
            });

            // Update form fields with extracted data from resumeData
            if (response.data.resumeData) {
                setFreelancerData(prevData => ({
                    ...prevData,
                    skills: response.data.resumeData.skills || prevData.skills,
                    codingLanguages: response.data.resumeData.codingLanguages || prevData.codingLanguages,
                    yearsOfExperience: response.data.resumeData.yearsOfExperience || prevData.yearsOfExperience,
                    certificates: response.data.resumeData.certificates || prevData.certificates
                }));
            }
        } catch (err) {
            console.error("Chat error:", err);
            // Replace loading message with error
            setChatMessages(prev => {
                const updated = [...prev];
                updated[loadingMsgIndex] = {
                    sender: "bot",
                    text: "Sorry, I encountered an error. Please try again."
                };
                return updated;
            });
        }

        setChatInput("");
    };

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-[80vh] gap-8 py-8 px-4 max-w-5xl mx-auto">
            <h1>TESTING PROFILE UPDATE - SHOULD BE VISIBLE</h1>
            {/* Header Section */}
            <div className="text-center mb-4">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Freelancer Profile</h2>
                <p className="text-gray-600">Set up your freelancer profile to showcase your skills and expertise</p>
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
                                value={freelancerData.userName}
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
                                value={freelancerData.fullName}
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
                            value={freelancerData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
                            placeholder="Tell us about yourself and your background"
                            required
                        ></textarea>
                    </div>
                </div>

                <div className="mt-10">
                    <h3 className="text-xl font-semibold mb-6 text-gray-700 border-b pb-2">
                        <div className="flex items-center gap-2">
                            <FaBriefcase className="text-blue-600" />
                            <span>Skills & Expertise</span>
                        </div>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="skills">
                                Skills
                            </label>
                            <input
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                type="text"
                                name="skills"
                                id="skills"
                                placeholder="UI/UX Design, Mobile Development, etc."
                                value={freelancerData.skills.join(", ")}
                                onChange={(e) => setFreelancerData({ ...freelancerData, skills: e.target.value.split(",").map(skill => skill.trim()) })}
                            />
                            <p className="text-xs text-gray-500 mt-1">Separate multiple skills with commas</p>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="codingLanguages">
                                Programming Languages
                            </label>
                            <input
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                type="text"
                                name="codingLanguages"
                                id="codingLanguages"
                                placeholder="JavaScript, Python, Java, etc."
                                value={freelancerData.codingLanguages.join(", ")}
                                onChange={(e) => setFreelancerData({ ...freelancerData, codingLanguages: e.target.value.split(",").map(lang => lang.trim()) })}
                            />
                            <p className="text-xs text-gray-500 mt-1">Separate multiple languages with commas</p>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="yearsOfExperience">
                                Years of Experience
                            </label>
                            <input
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                type="number"
                                name="yearsOfExperience"
                                id="yearsOfExperience"
                                placeholder="0"
                                min="0"
                                max="50"
                                value={freelancerData.yearsOfExperience}
                                onChange={(e) => setFreelancerData({ ...freelancerData, yearsOfExperience: parseInt(e.target.value) })}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="certificates">

                            </label>
                            <input
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                type="text"
                                name="certificates"
                                id="certificates"
                                placeholder="AWS Certified, Google Cloud Professional, etc."
                                value={freelancerData.certificates.join(", ")}
                                onChange={(e) => setFreelancerData({ ...freelancerData, certificates: e.target.value.split(",").map(cert => cert.trim()) })}
                            />
                            <p className="text-xs text-gray-500 mt-1">Separate multiple certifications with commas</p>
                        </div>
                    </div>
                </div>

                {/* Hourly Rate Section */}
                <div className="mt-10">
                    <h3 className="text-xl font-semibold mb-6 text-gray-700 border-b pb-2">
                        <div className="flex items-center gap-2">
                            <FaBriefcase className="text-blue-600" />
                            <span>Pricing</span>
                        </div>
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="hourlyRate">
                                Hourly Rate (USD) *
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    name="hourlyRate"
                                    id="hourlyRate"
                                    value={freelancerData.hourlyRate}
                                    onChange={handleChange}
                                    className="w-full pl-8 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter your hourly rate"
                                    min="1"
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Set your hourly rate for clients</p>
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

            {/* Chatbot Toggle Button */}
            <button
                className={`fixed bottom-6 left-6 w-16 h-16 rounded-full flex items-center justify-center shadow-lg z-50 transition-colors duration-300 ${isChatOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                onClick={toggleChat}
                aria-label={isChatOpen ? "Close chat assistant" : "Open chat assistant"}
            >
                {isChatOpen ? (
                    <FaTimes className="text-white text-xl" />
                ) : (
                    <RiRobot2Fill className="text-white text-2xl" />
                )}
            </button>

            {/* Chatbot Popup */}
            {isChatOpen && (
                <div className="fixed bottom-24 left-6 w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col z-40 border border-gray-200 overflow-hidden">
                    {/* Chat Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
                        <div className="flex items-center gap-2">
                            <RiRobot2Fill className="text-2xl" />
                            <div>
                                <h3 className="font-semibold">DevForge Assistant</h3>
                                <p className="text-xs opacity-80">
                                    I'll help you build a great freelancer profile
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                        <div className="space-y-4">
                            {chatMessages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    {msg.sender === "bot" && (
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                                            <RiRobot2Fill className="text-blue-600" />
                                        </div>
                                    )}

                                    <div
                                        className={`max-w-[70%] p-3 rounded-lg ${msg.sender === "user"
                                            ? "bg-blue-600 text-white rounded-br-none"
                                            : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                                            } ${msg.isLoading ? "animate-pulse" : ""}`}
                                    >
                                        {msg.text}
                                    </div>

                                    {msg.sender === "user" && (
                                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center ml-2">
                                            <span className="text-white text-sm font-semibold">
                                                {userInfo?.username?.[0]?.toUpperCase() || userInfo?.email?.[0]?.toUpperCase() || "U"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                    </div>

                    {/* Chat Input */}
                    <form
                        className="p-3 border-t border-gray-200 bg-white"
                        onSubmit={handleChatSubmit}
                    >
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Ask me about your freelancer profile..."
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <FaPaperPlane />
                            </button>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 text-center">
                            Try: "Help me showcase my skills" or "What should I include in my bio?"
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default FreelancerProfile; 