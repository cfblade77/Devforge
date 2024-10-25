"use client";

import React, { useState } from "react";

function Page() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="font-sans">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-blue-600">DevForge</div>
          <nav className="hidden md:flex space-x-4">
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
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50">
              Sign In
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Join
            </button>
            {/* Hamburger Icon */}
            <button
              onClick={toggleSidebar}
              className="md:hidden flex items-center justify-center p-2 text-gray-600 hover:text-blue-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar for Mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex justify-end">
          <div className="bg-white w-64 h-full p-4">
            <button
              onClick={toggleSidebar}
              className="absolute top-4 right-4 text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
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
      )}

      <main>
        <section className="bg-gray-100 py-16">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl font-bold mb-4">
                Get in Touch <span className="text-blue-600">with Us</span>
              </h1>
              <form className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Name*"
                  className="w-full p-2 border rounded"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email*"
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  name="subject"
                  placeholder="Subject*"
                  className="w-full p-2 border rounded"
                />
                <textarea
                  name="message"
                  rows="4"
                  placeholder="Message"
                  className="w-full p-2 border rounded"
                ></textarea>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Submit
                </button>
              </form>
            </div>
            <div className="md:w-1/2 relative">
              <img
                src="images/customer.jpg"
                alt="Friendly customer service representative waving"
                className="w-full h-auto"
              />
              <div className="absolute bottom-4 left-4 bg-white p-2 rounded-lg shadow-md flex items-center">
                {/* <img
                  src="/path-to-avatar.jpg"
                  alt="Ryan Chen"
                  className="w-10 h-10 rounded-full mr-2"
                /> */}
                {/* <div>
                  <p className="font-semibold">Ryan Chen</p>
                  <div className="text-yellow-400">★★★★★</div>
                </div> */}
              </div>
            </div>
          </div>
        </section>

        {/* <section className="py-16">
          <div className="container mx-auto px-4 flex flex-col md:flex-row">
            <div className="md:w-2/3 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold mb-8">
                Our Office <span className="text-blue-600">Location</span>
              </h2>
              <img
                src="/path-to-map.jpg"
                alt="Map showing office locations"
                className="w-full h-auto"
              />
            </div>
            <div className="md:w-1/3 md:pl-8">
              <div className="bg-navy-800 text-white p-6 rounded-lg mb-8">
                <h3 className="text-2xl font-bold mb-4">Our Contact</h3>
                <div className="space-y-2">
                  <p>
                    <i className="fas fa-phone mr-2"></i>Phone Number:
                    123-456-7890
                  </p>
                  <p>
                    <i className="fas fa-mobile-alt mr-2"></i>Mobile Number:
                    +123-456-7890
                  </p>
                  <p>
                    <i className="fas fa-envelope mr-2"></i>Email Address:
                    hello@yourwebsite.com
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((office) => (
                  <div
                    key={office}
                    className="flex items-center bg-white p-4 rounded-lg shadow"
                  >
                    <img
                      src={`/path-to-office${office}.jpg`}
                      alt={`Office ${office}`}
                      className="w-16 h-16 object-cover rounded mr-4"
                    />
                    <div>
                      <h4 className="font-semibold">Office {office}</h4>
                      <p className="text-sm text-gray-600">
                        123 Anywhere St, Any City, ST 12345
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section> */}

        <section className="bg-blue-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Stay Up to Date with Our Latest Innovations: Sign Up for Our
              Newsletter!
            </h2>
            <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                name="name"
                placeholder="Name*"
                className="flex-grow p-2 rounded text-gray-800"
              />
              <input
                type="email"
                name="email"
                placeholder="Email*"
                className="flex-grow p-2 rounded text-gray-800"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-white text-blue-600 rounded"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="bg-navy-900 text-white py-12">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 GigNotion. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Page;
