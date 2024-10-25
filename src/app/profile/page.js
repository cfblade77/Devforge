"use client";

import React, { useState } from "react";

function Page() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="font-sans">
      {/* Navbar */}
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-blue-600">DevForge</div>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-4">
            <a href="#" className="text-gray-600 hover:text-blue-600">
              Home
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600">
              Project
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600">
              Profile
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600">
              About Us
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600">
              Blog
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600">
              Contact
            </a>
          </div>

          {/* Hamburger Icon */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              className="px-4 py-2 text-blue-600 hover:text-blue-700"
              onClick={toggleSidebar}
            >
              ☰ {/* Hamburger Icon */}
            </button>
          </div>

          {/* Sign In/Join buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <button className="px-4 py-2 text-blue-600 hover:text-blue-700">
              Sign In
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Join
            </button>
          </div>
        </nav>
      </header>

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-lg w-64 z-50 transform ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="p-4">
          <button
            onClick={toggleSidebar}
            className="text-gray-600 hover:text-blue-600 mb-4"
          >
            ✖ {/* Close Icon */}
          </button>
          <nav className="flex flex-col space-y-4">
            <a href="#" className="text-gray-600 hover:text-blue-600">
              Home
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600">
              Project
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600">
              Profile
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600">
              About Us
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600">
              Blog
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600">
              Contact
            </a>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-500 mb-4">
          <span>Home</span> &gt; <span>Employers</span> &gt;{" "}
          <span>Ayush Mange</span>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row">
            <img
              src="images/men.webp"
              alt="Profile picture"
              className="w-32 h-32 rounded-full mb-4 md:mb-0 md:mr-6"
            />
            <div>
              <h1 className="text-2xl font-bold mb-2">Ayush Mange</h1>
              <div className="flex items-center mb-2">
                <i className="fas fa-star text-yellow-400"></i>
                <i className="fas fa-star text-yellow-400"></i>
                <i className="fas fa-star text-yellow-400"></i>
                <i className="fas fa-star text-yellow-400"></i>
                <i className="fas fa-star text-yellow-400"></i>
                <span className="ml-2 text-gray-600">5.0</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <p>
                  <strong>Location:</strong> Mumbai, IN
                </p>
                <p>
                  <strong>Member Since:</strong> March 2025
                </p>
                <p>
                  <strong>Number of Active Projects:</strong> 6
                </p>
                <p>
                  <strong>Last Online:</strong> 1 hour ago
                </p>
                <p>
                  <strong>Languages:</strong> English
                </p>
              </div>
              <p className="text-gray-600 mb-4">
                I'm a professional copywriter with 5 years of experience
                crafting compelling content for businesses of all sizes. My
                writing is focused on engaging readers and driving action,
                whether that means increasing sales, building brand awareness,
                or educating target audiences. With a keen eye for detail and a
                passion for clear communication, I'm dedicated to delivering
                high-quality work that meets my clients' needs and exceeds their
                expectations.
              </p>
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Follow
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Active Projects Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Active Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Social Media Management",
              "Content Creation",
              "Website Redesign",
              "Email Marketing Campaign",
              "Brand Identity Design",
              "Market Research",
            ].map((project, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-bold mb-2">{project}</h3>
                <p className="text-gray-600 mb-2">Writing and Editing</p>
                <p className="text-sm text-gray-500 mb-2">
                  Due Date:{" "}
                  {
                    [
                      "March 31, 2025",
                      "April 15, 2026",
                      "May 31, 2025",
                      "June 30, 2023",
                      "July 31, 2024",
                      "August 31, 2023",
                    ][index]
                  }
                </p>
                <span className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  $500
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Related Employers Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Related Employers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {["Vrishi", "Kush", "Nishad", "Alex Kim"].map((name, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-4 text-center"
              >
                <img
                  // src={`/path-to-${name
                  //   .toLowerCase()
                  //   .replace(" ", "-")}-image.jpg`}
                  src="images/men.webp"
                  alt={name}
                  className="w-24 h-24 rounded-full mx-auto mb-2"
                />
                <h3 className="font-bold">{name}</h3>
                <p className="text-sm text-gray-500">
                  {
                    ["Mumbai", "Delhi, IN", "Osaka, JP", "Seoul, South Korea"][
                      index
                    ]
                  }
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Page;
