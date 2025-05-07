import React, { useState, useRef, useEffect } from 'react';
import { FaTimes, FaPaperPlane, FaExternalLinkAlt } from 'react-icons/fa';
import { RiRobot2Fill } from 'react-icons/ri';
import axios from 'axios';
import { HOST } from '../../utils/constants';

function ProfileSearchChatbot({ userInfo = {} }) {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState([
        {
            sender: "bot",
            text: "Hi there! I can help you find freelancer profiles based on skills, experience, or specific expertise. What kind of talent are you looking for?",
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    // Scroll to bottom of chat when new messages arrive
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    };

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || isLoading) return;

        // Add user message to chat
        addMessage("user", chatInput);
        const userQuery = chatInput.trim();
        setChatInput('');
        setIsLoading(true);

        // Add loading message
        const loadingMsgIndex = chatMessages.length;
        setChatMessages(prev => [...prev, { sender: "bot", text: "Searching profiles...", isLoading: true }]);

        try {
            const response = await axios.post(`${HOST}/api/ai-chat/profile-search`, {
                message: userQuery,
                chatHistory: chatMessages.filter(msg => !msg.isLoading)
            });
            
            // Remove loading message
            setChatMessages(prev => prev.filter((_, index) => index !== loadingMsgIndex));
            
            if (response.data.success) {
                // Add AI response
                addMessage("bot", response.data.aiResponse);
                
                // If there are search results, display profile cards
                if (response.data.isProfileSearch && response.data.searchResults.length > 0) {
                    displayProfileCards(response.data.searchResults);
                }
            } else {
                addMessage("bot", "Sorry, I couldn't process your request. Please try again.");
            }
        } catch (error) {
            console.error("Error in chat:", error);
            setChatMessages(prev => prev.filter((_, index) => index !== loadingMsgIndex));
            addMessage("bot", "Sorry, I encountered an error. Please try again with different search terms.");
        } finally {
            setIsLoading(false);
        }
    };

    const addMessage = (sender, text) => {
        setChatMessages(prev => [...prev, { sender, text }]);
    };

    const displayProfileCards = (profiles) => {
        // Add a container for profile cards
        addMessage("bot", 
            <div className="profile-cards">
                {profiles.map((profile, index) => (
                    <div key={index} className="profile-card p-3 border border-gray-200 rounded-md mb-2 bg-gray-50">
                        <div className="font-semibold">{profile.fullName || profile.username}</div>
                        {profile.skills?.length > 0 && (
                            <div className="text-xs mt-1">
                                <span className="font-medium">Skills:</span>{" "}
                                {profile.skills.slice(0, 3).join(", ")}
                                {profile.skills.length > 3 && "..."}
                            </div>
                        )}
                        <div className="flex justify-between items-center text-xs mt-2">
                            <span>{profile.yearsOfExperience} years exp.</span>
                            {profile.hourlyRate && <span>${profile.hourlyRate}/hr</span>}
                        </div>
                        <a 
                            href={profile.profileUrl} 
                            className="mt-2 text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        >
                            View Profile <FaExternalLinkAlt size={10} />
                        </a>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
            {/* Chatbot Toggle Button */}
            <button
                className={`fixed bottom-6 left-6 w-16 h-16 rounded-full flex items-center justify-center shadow-lg z-50 transition-colors duration-300 ${isChatOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                onClick={toggleChat}
                aria-label={isChatOpen ? "Close search assistant" : "Open search assistant"}
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
                                <h3 className="font-semibold">DevForge Profile Search</h3>
                                <p className="text-xs opacity-80">
                                    Powered by Gemini AI
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
                                placeholder="Search for freelancers..."
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                className={`bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isLoading}
                            >
                                <FaPaperPlane />
                            </button>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 text-center">
                            Try: "React developers" or "Java experts with 5+ years experience"
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}

export default ProfileSearchChatbot;