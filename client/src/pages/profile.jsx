import { useStateProvider } from "../context/StateContext";
import { reducerCases } from "../context/constants";
import {
  HOST,
  SET_USER_INFO,
  UPDATE_CLIENT_COMPANY
} from "../utils/constants";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState, useRef } from "react";
import { RiRobot2Fill } from "react-icons/ri";
import { FaTimes, FaPaperPlane, FaBriefcase, FaCode } from "react-icons/fa";
import { BsBuilding } from "react-icons/bs";

function Profile() {
  const router = useRouter();
  const [{ userInfo }, dispatch] = useStateProvider();
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Freelancer data state
  const [freelancerData, setFreelancerData] = useState({
    username: "",
    fullName: "",
    description: "",
    skills: [],
    codingLanguages: [],
    yearsOfExperience: 0,
    certificates: [],
    hourlyRate: 0,
  });

  // Client data state
  const [clientData, setClientData] = useState({
    username: "",
    fullName: "",
    description: "",
    companyName: "",
    companyDescription: "",
    industry: "",
    companySize: "",
    website: "",
    companyLocation: "",
  });

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatEndRef = useRef(null);

  // Determine if the user is a freelancer or client
  const isFreelancer = userInfo?.role === 'freelancer';

  useEffect(() => {
    if (userInfo) {
      // Common fields for both roles
      const common = {
        username: userInfo?.username || "",
        fullName: userInfo?.fullName || "",
        description: userInfo?.description || "",
      };

      if (isFreelancer) {
        // Set freelancer specific data
        setFreelancerData({
          ...common,
          skills: userInfo?.skills || [],
          codingLanguages: userInfo?.codingLanguages || [],
          yearsOfExperience: userInfo?.yearsOfExperience || 0,
          certificates: userInfo?.certificates || [],
          hourlyRate: userInfo?.hourlyRate || 0,
        });
      } else {
        // Set client specific data
        setClientData({
          ...common,
          companyName: userInfo?.companyName || "",
          companyDescription: userInfo?.companyDescription || "",
          industry: userInfo?.industry || "",
          companySize: userInfo?.companySize || "",
          website: userInfo?.website || "",
          companyLocation: userInfo?.companyLocation || "",
        });
      }

      setIsLoaded(true);
    }
  }, [userInfo, isFreelancer]);

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
        // Add welcome message - customized based on user role
        setChatMessages([{
          sender: "bot",
          text: `Hi there! I'm your DevForge assistant. I can help you complete your ${isFreelancer ? 'freelancer' : 'client'} profile. Let me know what you need help with!`
        }]);
      } catch (err) {
        console.error('Failed to initialize chat session:', err);
      }
    };

    initChatSession();
  }, [isFreelancer]);

  // Handle changes for freelancer form
  const handleFreelancerChange = (e) => {
    setFreelancerData({ ...freelancerData, [e.target.name]: e.target.value });
  };

  // Handle changes for client form
  const handleClientChange = (e) => {
    setClientData({ ...clientData, [e.target.name]: e.target.value });
  };

  const setProfile = async () => {
    // Determine which data to use based on user role
    const data = isFreelancer ? freelancerData : clientData;

    // Enhanced logging to debug the request
    console.log("Form submission data:", {
      userId: userInfo.id,
      role: isFreelancer ? 'freelancer' : 'client',
      ...data
    });

    // Validate required fields
    if (!data.username || !data.fullName || !data.description) {
      setErrorMessage("Username, Full Name, and Description are required fields");
      return;
    }

    // Additional validation for client
    if (!isFreelancer && !data.companyName) {
      setErrorMessage("Company Name is required for client profiles");
      return;
    }

    try {
      // For clients, always use the dedicated company endpoint
      if (!isFreelancer) {
        console.log("Sending client data directly to:", UPDATE_CLIENT_COMPANY);
        const companyResponse = await axios.post(
          UPDATE_CLIENT_COMPANY,
          {
            userId: userInfo.id,
            username: data.username,
            fullName: data.fullName,
            description: data.description,
            companyName: data.companyName,
            companyDescription: data.companyDescription,
            industry: data.industry,
            companySize: data.companySize,
            website: data.website,
            companyLocation: data.companyLocation,
            role: 'client'
          },
          { withCredentials: true }
        );
        console.log("Client profile response:", companyResponse.data);

        // Update the global user state
        dispatch({
          type: reducerCases.SET_USER,
          userInfo: {
            ...userInfo,
            ...data,
          },
        });

        router.push("/");
        return;
      }

      // For freelancers, use the original endpoint
      console.log("Sending profile update request to:", SET_USER_INFO);
      const response = await axios.post(
        SET_USER_INFO,
        {
          ...data,
          userId: userInfo.id,
          role: 'freelancer'
        },
        { withCredentials: true }
      );
      console.log("Profile update response:", response.data);

      if (response.data.userNameError) {
        setErrorMessage("Enter a Unique Username");
      } else {
        // Update the global user state
        dispatch({
          type: reducerCases.SET_USER,
          userInfo: {
            ...userInfo,
            ...data,
          },
        });

        router.push("/");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      if (err.response) {
        console.error("Error response data:", err.response.data);
        console.error("Error response status:", err.response.status);
      }
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

      // Update form fields with extracted data from resumeData based on user role
      if (response.data.resumeData) {
        if (isFreelancer) {
          setFreelancerData(prevData => ({
            ...prevData,
            skills: response.data.resumeData.skills || prevData.skills,
            codingLanguages: response.data.resumeData.codingLanguages || prevData.codingLanguages,
            yearsOfExperience: response.data.resumeData.yearsOfExperience || prevData.yearsOfExperience,
            certificates: response.data.resumeData.certificates || prevData.certificates
          }));
        } else {
          setClientData(prevData => ({
            ...prevData,
            companyName: response.data.resumeData.companyName || prevData.companyName,
            industry: response.data.resumeData.industry || prevData.industry,
            companyDescription: response.data.resumeData.companyDescription || prevData.companyDescription,
            companySize: response.data.resumeData.companySize || prevData.companySize,
            website: response.data.resumeData.website || prevData.website
          }));
        }
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

  // Render the Freelancer Profile Form
  const renderFreelancerForm = () => (
    <>
      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-6 text-gray-700 border-b pb-2">
          <div className="flex items-center gap-2">
            <FaCode className="text-blue-600" />
            <span>Personal Information</span>
          </div>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="username">
              Username *
            </label>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              type="text"
              name="username"
              id="username"
              placeholder="Choose a unique username"
              value={freelancerData.username}
              onChange={handleFreelancerChange}
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
              onChange={handleFreelancerChange}
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
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Write a short description about yourself..."
            value={freelancerData.description}
            onChange={handleFreelancerChange}
            required
          ></textarea>
        </div>

        {/* Hourly Rate Input */}
        <div className="mb-4">
          <label
            htmlFor="hourlyRate"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Hourly Rate ($)
          </label>
          <input
            type="number"
            name="hourlyRate"
            id="hourlyRate"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="e.g., 50"
            value={freelancerData.hourlyRate}
            onChange={handleFreelancerChange}
            min="0" // Optional: prevent negative rates
          />
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
              Certifications
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
    </>
  );

  // Render the Client Profile Form
  const renderClientForm = () => (
    <>
      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-6 text-gray-700 border-b pb-2">
          <div className="flex items-center gap-2">
            <FaCode className="text-blue-600" />
            <span>Personal Information</span>
          </div>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="username">
              Username *
            </label>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              type="text"
              name="username"
              id="username"
              placeholder="Choose a unique username"
              value={clientData.username}
              onChange={handleClientChange}
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
              onChange={handleClientChange}
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
            onChange={handleClientChange}
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
              onChange={handleClientChange}
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
              onChange={handleClientChange}
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
              onChange={handleClientChange}
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
              onChange={handleClientChange}
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
              onChange={handleClientChange}
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
              onChange={handleClientChange}
            />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {isLoaded && (
        <div className="flex flex-col items-center justify-start min-h-[80vh] gap-8 py-8 px-4 max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {isFreelancer ? "Freelancer Profile" : "Client Profile"}
            </h2>
            <p className="text-gray-600">
              {isFreelancer
                ? "Set up your freelancer profile to showcase your skills and expertise"
                : "Complete your client profile to help us connect you with the right freelancers"}
            </p>
            {errorMessage && (
              <div className="mt-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
                <p>{errorMessage}</p>
              </div>
            )}
          </div>

          {/* Main Form */}
          <div className="w-full bg-white shadow-lg rounded-xl p-8 border border-gray-200">
            {/* Render appropriate form based on user role */}
            {isFreelancer ? renderFreelancerForm() : renderClientForm()}

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
                      {isFreelancer
                        ? "I'll help you build a great freelancer profile"
                        : "I'll help you set up your client profile"}
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
                      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"
                        }`}
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
                    placeholder={isFreelancer
                      ? "Ask me about your freelancer profile..."
                      : "Ask me about your client profile..."}
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
                  {isFreelancer
                    ? "Try: \"Help me showcase my skills\" or \"What should I include in my bio?\""
                    : "Try: \"What company details should I include?\" or \"Help me write a company description\""}
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default Profile;
