"use client";

import { useState } from "react";
import Image from "next/image";

const Login = () => {
  // State for form data and message
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // To handle success/error message type

  // Handle input changes for all fields
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json(); // Get the response as JSON

    if (res.ok) {
      // Show success message
      setMessage(data.message); // "User validated"
      setMessageType("success");
      // You can decide if you want to redirect or not
      setTimeout(() => {
        window.location.href = "/"; // Redirect to the home page after 1 second
      }, 1000); // Adjust the delay as needed
    } else {
      // Handle error messages
      setMessage(data.error || "An unexpected error occurred.");
      setMessageType("error");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-4xl">
        <div className="md:flex">
          {/* Left Side Image */}
          <div className="relative hidden md:block md:w-1/2">
            <Image
              src="/images/login.avif" // Path to your image
              alt="Login Image"
              layout="fill"
              objectFit="cover"
            />
          </div>

          {/* Right Side Form */}
          <div className="w-full md:w-1/2 p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-700">
              Login to Your Account
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-600">Username/Email</label>
                <input
                  type="text"
                  name="identifier"
                  placeholder="Enter your username or email"
                  value={formData.identifier}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-500 transition-colors"
              >
                Login
              </button>
            </form>

            {message && (
              <p
                className={`mt-4 ${
                  messageType === "success" ? "text-green-500" : "text-red-500"
                }`}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
