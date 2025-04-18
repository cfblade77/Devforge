import { useStateProvider } from "../context/StateContext";
import { reducerCases } from "../context/constants";
import {
  HOST,
  IMAGES_URL,
  SET_USER_IMAGE,
  SET_USER_INFO,
} from "../utils/constants";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

function Profile() {
  const router = useRouter();
  const [{ userInfo }, dispatch] = useStateProvider();
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageHover, setImageHover] = useState(false);
  const [image, setImage] = useState(undefined);
  const [errorMessage, setErrorMessage] = useState("");
  const [data, setData] = useState({
    userName: "",
    fullName: "",
    description: "",
    skills: [],
    codingLanguages: [],
    yearsOfExperience: 0,
    certificates: [],
  });

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    const handleData = { ...data };
    if (userInfo) {
      if (userInfo?.username) handleData.userName = userInfo?.username;
      if (userInfo?.description) handleData.description = userInfo?.description;
      if (userInfo?.fullName) handleData.fullName = userInfo?.fullName;
      console.log({ userInfo });

      if (userInfo?.imageName) {
        const fileName = image;
        fetch(userInfo.imageName).then(async (response) => {
          const contentType = response.headers.get("content-type");
          const blob = await response.blob();
          // @ts-ignore
          const files = new File([blob], fileName, { contentType });
          // @ts-ignore
          setImage(files);
        });
      }

      setData(handleData);
      setIsLoaded(true);
    }
  }, [userInfo]);

  useEffect(() => {
    // Initialize chat session when component mounts
    const initChatSession = async () => {
      try {
        await axios.get('/api/chat', { withCredentials: true });
        console.log('Chat session initialized');
      } catch (err) {
        console.error('Failed to initialize chat session:', err);
      }
    };
    
    initChatSession();
  }, []);

  const handleFile = (e) => {
    let file = e.target.files;
    const fileType = file[0]["type"];
    const validImageTypes = ["image/gif", "image/jpeg", "image/png"];
    if (validImageTypes.includes(fileType)) {
      setImage(file[0]);
    }
  };
  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const setProfile = async () => {
    // Validate required fields
    if (!data.userName || !data.fullName || !data.description) {
      setErrorMessage("Username, Full Name, and Description are required fields");
      return;
    }
  
    try {
      const response = await axios.post(
        SET_USER_INFO,
        { ...data },
        { withCredentials: true }
      );
      if (response.data.userNameError) {
        setErrorMessage("Enter a Unique Username");
      } else {
        let imageName = "";
        if (image) {
          const formData = new FormData();
          formData.append("images", image);
          const {
            data: { img },
          } = await axios.post(SET_USER_IMAGE, formData, {
            withCredentials: true,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          imageName = img;
        }
  
        dispatch({
          type: reducerCases.SET_USER,
          userInfo: {
            ...userInfo,
            ...data,
            image: imageName.length ? HOST + "/" + imageName : false,
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

  const handleChatSubmit = async () => {
    if (chatInput.trim() === "") return;

    // Add user message to chat
    setChatMessages((prev) => [...prev, { sender: "user", text: chatInput }]);
    
    try {
      // Send message to chatbot backend
      const response = await axios.post("/api/chat", { 
        message: chatInput
      }, { withCredentials: true }); // Add withCredentials for cookies
      
      // Add bot response to chat
      setChatMessages((prev) => [...prev, { sender: "bot", text: response.data.response }]);
      
      // Update form fields with extracted data from resumeData (not updatedFields)
      if (response.data.resumeData) {
        setData(prevData => ({
          ...prevData,
          skills: response.data.resumeData.skills || prevData.skills,
          codingLanguages: response.data.resumeData.codingLanguages || prevData.codingLanguages,
          yearsOfExperience: response.data.resumeData.yearsOfExperience || prevData.yearsOfExperience,
          certificates: response.data.resumeData.certificates || prevData.certificates
        }));
      }
    } catch (err) {
      // ...existing error handling...
    }
    
    setChatInput("");
  };

  const inputClassName =
    "block p-4 w-full text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50  focus:ring-blue-500 focus:border-blue-500";
  const labelClassName =
    "mb-2 text-lg font-medium text-gray-900  dark:text-white";
  return (
    <>
      {isLoaded && (
        <div className="flex flex-col items-center justify-start min-h-[80vh] gap-3">
          {errorMessage && (
            <div>
              <span className="text-red-600 font-bold">{errorMessage}</span>
            </div>
          )}
          <h2 className="text-3xl">Welcome to Devforge</h2>
          <h4 className="text-xl">
            Please complete your profile to get started
          </h4>
          <div className="flex flex-col items-center w-full gap-5">
            <div
              className="flex flex-col items-center cursor-pointer"
              onMouseEnter={() => setImageHover(true)}
              onMouseLeave={() => setImageHover(false)}
            >
              <label className={labelClassName} htmlFor="">
                Select a profile Picture
              </label>
              <div className="bg-purple-500 h-36 w-36 flex items-center justify-center rounded-full relative">
                {image ? (
                  <Image
                    src={URL.createObjectURL(image)} // For newly uploaded images
                    alt="profile"
                    fill
                    className="rounded-full"
                  />
                ) : userInfo.imageName ? (
                  <Image
                    src={userInfo.imageName.startsWith("http") ? userInfo.imageName : `/${userInfo.imageName}`} // Ensure proper formatting
                    alt="profile"
                    fill
                    className="rounded-full"
                  />
                ) : (
                  <span className="text-6xl text-white">
                    {userInfo.email[0].toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-4 w-[500px]">
              <div>
                <label className={labelClassName} htmlFor="userName">
                  Please select a username
                </label>
                <input
                  className={inputClassName}
                  type="text"
                  name="userName"
                  id="userName"
                  placeholder="Username"
                  value={data.userName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className={labelClassName} htmlFor="fullName">
                  Please enter your full Name
                </label>
                <input
                  className={inputClassName}
                  type="text"
                  name="fullName"
                  id="fullName"
                  placeholder="Full Name"
                  value={data.fullName}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="flex flex-col w-[500px]">
              <label className={labelClassName} htmlFor="description">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                value={data.description}
                onChange={handleChange}
                className={inputClassName}
                placeholder="description"
              ></textarea>
            </div>
            <div>
              <label className={labelClassName} htmlFor="skills">Skills</label>
              <input
                className={inputClassName}
                type="text"
                name="skills"
                id="skills"
                placeholder="Enter skills (comma-separated)"
                value={data.skills.join(", ")}
                onChange={(e) => setData({ ...data, skills: e.target.value.split(",").map(skill => skill.trim()) })}
              />
            </div>

            <div>
              <label className={labelClassName} htmlFor="codingLanguages">Coding Languages</label>
              <input
                className={inputClassName}
                type="text"
                name="codingLanguages"
                id="codingLanguages"
                placeholder="Enter coding languages (comma-separated)"
                value={data.codingLanguages.join(", ")}
                onChange={(e) => setData({ ...data, codingLanguages: e.target.value.split(",").map(lang => lang.trim()) })}
              />
            </div>

            <div>
              <label className={labelClassName} htmlFor="yearsOfExperience">Years of Experience</label>
              <input
                className={inputClassName}
                type="number"
                name="yearsOfExperience"
                id="yearsOfExperience"
                placeholder="Enter years of experience"
                value={data.yearsOfExperience}
                onChange={(e) => setData({ ...data, yearsOfExperience: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <label className={labelClassName} htmlFor="certificates">Certificates</label>
              <input
                className={inputClassName}
                type="text"
                name="certificates"
                id="certificates"
                placeholder="Enter certificates (comma-separated)"
                value={data.certificates.join(", ")}
                onChange={(e) => setData({ ...data, certificates: e.target.value.split(",").map(cert => cert.trim()) })}
              />
            </div>

            {/* Chatbot Section */}
            <div className="w-[500px] border p-4 rounded-lg">
              <h3 className="text-lg font-bold mb-2">Chatbot Assistant</h3>
              <div className="h-64 overflow-y-auto border p-2 mb-2">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`${
                      msg.sender === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    <span
                      className={`inline-block p-2 rounded-lg ${
                        msg.sender === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-black"
                      }`}
                    >
                      {msg.text}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  className={inputClassName}
                  placeholder="Type your message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                  onClick={handleChatSubmit}
                >
                  Send
                </button>
              </div>
            </div>

            <button
              className="border   text-lg font-semibold px-5 py-3   border-[#1DBF73] bg-[#1DBF73] text-white rounded-md"
              type="button"
              onClick={setProfile}
            >
              Set Profile
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Profile;
