"use client";
import React, { useState } from "react";

function Page() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="font-sans">
      <header className="flex justify-between items-center p-4 bg-white">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-blue-600">DevForge</h1>
          <nav className="hidden md:flex ml-8">
            <a href="#" className="mx-2 text-gray-600 hover:text-blue-600">
              Home
            </a>
            <a href="#" className="mx-2 text-gray-600 hover:text-blue-600">
              Project
            </a>
            <a href="#" className="mx-2 text-gray-600 hover:text-blue-600">
              Profile
            </a>
            <a href="#" className="mx-2 text-gray-600 hover:text-blue-600">
              About Us
            </a>
            <a href="#" className="mx-2 text-gray-600 hover:text-blue-600">
              Blog
            </a>
            <a href="#" className="mx-2 text-gray-600 hover:text-blue-600">
              Contact
            </a>
          </nav>
        </div>

        {/* Hamburger Icon for mobile */}
        <div className="md:hidden">
          <button onClick={toggleSidebar} className="flex flex-col space-y-1">
            <span className="block w-6 h-0.5 bg-gray-600"></span>
            <span className="block w-6 h-0.5 bg-gray-600"></span>
            <span className="block w-6 h-0.5 bg-gray-600"></span>
          </button>
        </div>

        {/* Desktop Sign in and Create button */}
        <div className="hidden md:flex items-center">
          <a href="#" className="mr-4 text-gray-600 hover:text-blue-600">
            Sign in
          </a>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700">
            Create
          </button>
        </div>

        {/* Sidebar for mobile and tablet */}
        <div
          className={`fixed top-0 right-0 h-full bg-white shadow-lg p-6 transition-transform transform ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
          } md:hidden z-50`}
        >
          <button onClick={toggleSidebar} className="text-gray-600 mb-4">
            <span className="block w-6 h-0.5 bg-gray-600"></span>
            <span className="block w-6 h-0.5 bg-gray-600"></span>
            <span className="block w-6 h-0.5 bg-gray-600"></span>
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
      </header>

      <main className="container mx-auto px-4">
        <section className="flex flex-col md:flex-row items-center justify-between py-12">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Insights and Inspiration: The DevForge Blog
            </h2>
            <div className="flex flex-col space-y-2">
              <span className="flex items-center">
                <i className="fas fa-check text-blue-600 mr-2"></i> Freelancing
                Tips and Tricks
              </span>
              <span className="flex items-center">
                <i className="fas fa-check text-blue-600 mr-2"></i> Success
                Stories from Our Community
              </span>
              <span className="flex items-center">
                <i className="fas fa-check text-blue-600 mr-2"></i> Industry
                Trends and Analysis
              </span>
              <span className="flex items-center">
                <i className="fas fa-check text-blue-600 mr-2"></i> Productivity
                and Time Management
              </span>
            </div>
          </div>
          <div className="md:w-1/2">
            <img
              src="images/happy.jpg"
              alt="Happy freelancer pointing at GigNation logo"
              className="w-full rounded-lg"
            />
          </div>
        </section>

        <section className="py-12">
          <h3 className="text-2xl font-bold mb-6">Featured Blog Posts</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <img
                  src="images/proscons.png"
                  // src={`/path-to-featured-image-${index + 1}.jpg`}
                  alt="Featured blog post"
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h4 className="font-bold mb-2">
                    The Pros and Cons of Hiring Freelancers vs. Full-Time
                    Employees
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">By Vrishi</p>
                  <p className="text-sm text-gray-500">
                    Published on August 10, 2023
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12">
          <h3 className="text-2xl font-bold mb-6">Recent Blog Posts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <img
                  src="images/free.jpg"
                  // src={`/path-to-recent-image-${index + 1}.jpg`}
                  alt="Recent blog post"
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div>
                  <h4 className="font-bold mb-1">
                    How to Create a Successful Freelance Career
                  </h4>
                  <p className="text-sm text-gray-600 mb-1">By Vrishi</p>
                  <p className="text-sm text-gray-500">May 15, 2023</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-8 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700">
            Load more articles
          </button>
        </section>

        <section className="py-12">
          <h3 className="text-2xl font-bold mb-6">Article Categories</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              "Freelancing Tips and Tricks",
              "Success Stories from Our Community",
              "Industry Trends and Analysis",
              "Productivity and Time Management",
              "Creative Inspiration and Innovation",
              "Remote Work and the Future of Workplace",
            ].map((category, index) => (
              <div key={index} className="relative">
                <img
                  src="images/freelan.webp"
                  // src={`/path-to-category-image-${index + 1}.jpg`}
                  alt={category}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <h4 className="text-white font-bold text-center px-4">
                    {category}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h4 className="text-xl font-bold mb-4">
                Subscribe to our Newsletter
              </h4>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-2 rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-400 flex-grow"
                />
                <button className="bg-white text-blue-600 px-6 py-2 rounded-r-full hover:bg-gray-200">
                  Subscribe
                </button>
              </form>
            </div>
            <div className="flex flex-col md:flex-row justify-end">
              <ul className="space-y-2 md:space-y-0 md:space-x-4">
                <li>
                  <a href="#" className="hover:text-gray-200">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-200">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-200">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-200">
                    About Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Page;
