"use client";

import Image from "next/image";
import React, { useState } from "react";

function Page() {
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    supportTopic: "",
    message: "",
  });
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for sidebar visibility

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    // You can add form submission logic here
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen); // Function to toggle sidebar

  return (
    <div className="font-sans bg-gray-50">
      <header className="flex flex-col md:flex-row justify-between items-center p-4 bg-white shadow-md">
        <div className="text-2xl font-bold text-blue-600 mb-4 md:mb-0">
          DevForge
        </div>

        {/* Add a wrapper for nav and buttons to push the hamburger to the right */}
        <div className="flex items-center md:space-x-4 w-full md:w-auto md:justify-end">
          <nav className="hidden md:flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mb-4 md:mb-0">
            {["Home", "Project", "Profile", "About Us", "Blog", "Contact"].map(
              (item, index) => (
                <a
                  href="#"
                  key={index}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {item}
                </a>
              )
            )}
          </nav>

          {/* Hamburger Icon for mobile view */}
          <div className="md:hidden">
            <button onClick={toggleSidebar} className="focus:outline-none">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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

          <div className="flex space-x-2">
            <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded transition-colors hover:bg-blue-600 hover:text-white">
              Sign In
            </button>
            <button className="px-4 py-2 text-white bg-blue-600 rounded transition-colors hover:bg-blue-700">
              Join
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed top-0 right-0 w-64 h-full bg-white shadow-lg z-50 transition-transform transform translate-x-0">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold text-blue-600">Menu</h2>
            <button onClick={toggleSidebar} className="focus:outline-none">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
          </div>
          <nav className="flex flex-col space-y-2 p-4">
            {["Home", "Project", "Profile", "About Us", "Blog", "Contact"].map(
              (item, index) => (
                <a
                  href="#"
                  key={index}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                  onClick={toggleSidebar} // Close sidebar on link click
                >
                  {item}
                </a>
              )
            )}
          </nav>
        </div>
      )}

      <main className="container mx-auto px-4">
        <section className="flex flex-col md:flex-row items-center justify-between py-12">
          <div className="w-full md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Get Help and Support
            </h1>
            <p className="text-gray-600 mb-6">
              Get support from our knowledgeable and friendly team, dedicated to
              providing you with the assistance you need to ensure the best
              experience possible on our platform.
            </p>
            <div className="flex flex-col sm:flex-row">
              <input
                type="text"
                placeholder="Search for Help and Support Topics"
                className="flex-grow p-2 border rounded-l sm:rounded-l sm:rounded-t-none mb-2 sm:mb-0 shadow-sm"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <button className="bg-blue-600 text-white px-4 py-2 rounded-r sm:rounded-r-none hover:bg-blue-700 transition-colors">
                Search
              </button>
            </div>
            <div className="mt-4">
              <span className="text-blue-600 mr-4">✓ Secure</span>
              <span className="text-blue-600">✓ Easy to use</span>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            {/* <img
              src="images/suppp.png"
              alt="Support representative gesturing"
              className="w-full h-auto rounded shadow-lg"
            /> */}
          </div>
        </section>

        <section className="py-12">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Select Support Topic/Category
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Account and Billing",
                description:
                  "Help with setting up and managing your account, updating payment information, and resolving billing issues.",
                icon: "fa-file-invoice-dollar",
              },
              {
                title: "Technical Support",
                description:
                  "Assistance with technical issues, such as site performance, app crashes, or error messages.",
                icon: "fa-headset",
              },
              {
                title: "Freelancer Support",
                description:
                  "Guidance for freelancers, including tips for improving your profile, finding work, and managing client relationships.",
                icon: "fa-user-tie",
              },
              {
                title: "Employer Support",
                description:
                  "Help for employers, including advice on posting projects, hiring freelancers, and managing projects.",
                icon: "fa-users",
              },
              {
                title: "Security and Privacy",
                description:
                  "Information on how we protect your data and ensure the security and privacy of your account and transactions.",
                icon: "fa-shield-alt",
              },
              {
                title: "Troubleshooting",
                description:
                  "Solutions to common problems and issues that users may encounter on the platform.",
                icon: "fa-tools",
              },
              {
                title: "Feedback and Suggestions",
                description:
                  "A forum for providing feedback and suggestions on how we can improve our platform and services.",
                icon: "fa-comments",
              },
              {
                title: "Policies and Guidelines",
                description:
                  "Information on our policies, guidelines, and terms of service, including how we enforce them and what actions we take in case of violations.",
                icon: "fa-book",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-4 bg-white rounded shadow hover:shadow-lg transition-shadow"
              >
                <i
                  className={`fas ${item.icon} text-4xl text-blue-600 mb-4`}
                ></i>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12 flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 mb-8 md:mb-0">
            <Image
              src="/images/customer.jpg"
              alt="Contact support"
              width={600}
              height={400}
              className="rounded shadow-lg"
            />
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl font-bold mb-4">Contact Support</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                className="w-full p-2 border rounded shadow-sm"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                className="w-full p-2 border rounded shadow-sm"
                value={formData.email}
                onChange={handleFormChange}
                required
              />
              <select
                name="supportTopic"
                className="w-full p-2 border rounded shadow-sm"
                value={formData.supportTopic}
                onChange={handleFormChange}
                required
              >
                <option value="" disabled>
                  Select Support Topic
                </option>
                {[
                  "Account and Billing",
                  "Technical Support",
                  "Freelancer Support",
                  "Employer Support",
                  "Security and Privacy",
                  "Troubleshooting",
                  "Feedback and Suggestions",
                  "Policies and Guidelines",
                ].map((topic, index) => (
                  <option key={index} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
              <textarea
                name="message"
                placeholder="Your Message"
                className="w-full p-2 border rounded shadow-sm"
                value={formData.message}
                onChange={handleFormChange}
                required
              ></textarea>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                Submit
              </button>
            </form>
          </div>
        </section>
      </main>
      <footer className="py-4 text-center">
        <p className="text-gray-600">
          © {new Date().getFullYear()} DevForge. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default Page;
