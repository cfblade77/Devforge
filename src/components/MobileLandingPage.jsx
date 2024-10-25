import React, { useState } from 'react';

function MobileLandingPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="font-sans">
      <header className="bg-white py-4 px-4 flex flex-col items-center relative">
        <div className="flex flex-col items-center mb-4 w-full">
          <div className="flex justify-between items-center w-full">
            <img src="logo.png" alt="Company Logo" className="h-8 w-auto mb-4" />
            <button className="text-gray-600 focus:outline-none" onClick={toggleSidebar}>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>

          <nav className="w-full hidden md:flex">
            <ul className="flex flex-wrap justify-center space-x-4">
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600">
                  Shop
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600">
                  Product
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600">
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Sidebar */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out ${
            isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={toggleSidebar}
        ></div>
        <div
          className={`fixed right-0 top-0 h-full w-64 bg-white z-50 transition-transform transform ${
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <button className="absolute top-4 right-4" onClick={toggleSidebar}>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <ul className="flex flex-col items-start space-y-4 p-8">
            <li>
              <a href="#" className="text-gray-600 hover:text-blue-600">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-600 hover:text-blue-600">
                Shop
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-600 hover:text-blue-600">
                Product
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-600 hover:text-blue-600">
                Contact
              </a>
            </li>
          </ul>
        </div>

        <div className="flex flex-col items-center w-full space-y-4">
          <input
            type="text"
            placeholder="Search"
            className="border rounded-full px-4 py-2 w-full"
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded-full w-full">
            Sign Up
          </button>
        </div>
      </header>

      <section className="bg-gray-100 py-8 px-4">
        <div className="max-w-sm mx-auto flex flex-col items-center">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-4">
              The ultimate Destination for Freelance Talent and Client Success
            </h1>
            <p className="text-gray-600 mb-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit
              tellus, luctus nec ullamcorper mattis.
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-full w-full">
              Get Started Now
            </button>
          </div>
          <div className="w-full">
            <img
              src="hero-image.png"
              alt="Hero illustration"
              className="w-full"
            />
          </div>
        </div>
      </section>

      <section className="py-8 px-4">
        <h2 className="text-2xl font-bold text-center mb-6">Most Popular Services</h2>
        <div className="grid grid-cols-1 gap-6 max-w-sm mx-auto">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-white p-4 rounded-lg shadow">
              <img
                src={`product-${item}.png`}
                alt={`Product ${item}`}
                className="w-full h-48 object-cover mb-4 rounded"
              />
              <h3 className="font-semibold mb-2">Product Name</h3>
              <p className="text-gray-600 mb-2">Short description</p>
              <div className="flex justify-between items-center">
                <span className="font-bold">$XX.XX</span>
                <button className="bg-blue-600 text-white px-4 py-2 rounded">Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-full w-full">
            View All Services
          </button>
        </div>
      </section>

      <section className="bg-gray-100 py-8 px-4">
        <div className="max-w-sm mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">We Guarantee</h2>
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="text-center">
                <img
                  src={`icon-${item}.png`}
                  alt={`Feature ${item}`}
                  className="w-16 h-16 mx-auto mb-4"
                />
                <h3 className="font-semibold mb-2">Feature Title</h3>
                <p className="text-gray-600">
                  Feature description goes here. This explains the benefit.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Awesome Team Members</h2>
        <div className="grid grid-cols-2 gap-6 max-w-sm mx-auto">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="text-center">
              <img
                src={`team-${item}.png`}
                alt={`Team Member ${item}`}
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <h3 className="font-semibold">Team Member Name</h3>
              <p className="text-gray-600">Position</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-100 py-8 px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Choose the Plan That Works for You</h2>
        <div className="grid grid-cols-1 gap-6 max-w-sm mx-auto">
          {['Basic', 'Pro', 'Enterprise'].map((plan) => (
            <div key={plan} className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4">{plan}</h3>
              <p className="text-3xl font-bold mb-6">
                $XX<span className="text-sm font-normal">/month</span>
              </p>
              <ul className="mb-6">
                <li className="mb-2 flex items-center">
                  <i className="fas fa-check text-green-500 mr-2"></i> Feature 1
                </li>
                <li className="mb-2 flex items-center">
                  <i className="fas fa-check text-green-500 mr-2"></i> Feature 2
                </li>
                <li className="mb-2 flex items-center">
                  <i className="fas fa-check text-green-500 mr-2"></i> Feature 3
                </li>
              </ul>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-full w-full">
                Choose Plan
              </button>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-gray-800 py-8 text-white text-center">
        <p>&copy; 2023 Your Company. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default MobileLandingPage;
