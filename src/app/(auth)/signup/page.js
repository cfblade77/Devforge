"use client";

import { useState } from "react";
import Image from "next/image";

const Signup = () => {
  // Include the 'role' field in the initial state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "client",
  });
  const [message, setMessage] = useState("");

  // Handle input changes for all fields
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage(data.message);
    } else {
      setMessage(data.error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-4xl">
        <div className="md:flex">
          {/* Left Side Image */}
          <div className="relative hidden md:block md:w-1/2">
            <Image
              src="/images/signup.jpg" // Path to your image
              alt="Signup Image"
              layout="fill"
              objectFit="cover"
            />
          </div>

          {/* Right Side Form */}
          <div className="w-full md:w-1/2 p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-700">
              Create an Account
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-600">Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
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
              <div>
                <label className="block text-gray-600">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="client">Client</option>
                  <option value="developer">Developer</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-500 transition-colors"
              >
                Sign Up
              </button>
            </form>

            {message && <p className="mt-4 text-green-500">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
