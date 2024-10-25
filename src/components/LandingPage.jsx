import Image from "next/image";
import React from "react";

function LandingPage() {
  return (
    <div className="font-sans text-gray-800 scroll-smooth">
      <header className="bg-gradient-to-r from-blue-500 to-indigo-600 py-6 px-8 shadow-lg text-white">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center text-2xl font-bold">
            Devforge
            <nav className="ml-10">
              <ul className="flex space-x-8 text-lg">
                <li>
                  <a
                    href="#"
                    className="hover:text-yellow-300 transition-colors duration-300"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-yellow-300 transition-colors duration-300"
                  >
                    Shop
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-yellow-300 transition-colors duration-300"
                  >
                    Product
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-yellow-300 transition-colors duration-300"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search"
              className="border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-800 transition"
            />
            <button className="bg-yellow-400 text-gray-800 px-6 py-2 rounded-full hover:bg-yellow-500 transition duration-300">
              Sign Up
            </button>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-b from-gray-50 to-gray-200 py-16">
        <div className="container mx-auto flex flex-col md:flex-row items-center px-6">
          <div className="w-full md:w-1/2 mb-8 md:mb-0 pr-8">
            <h1 className="text-5xl font-extrabold text-gray-800 mb-6 leading-tight animate-fade-in-up">
              The Ultimate Destination for Freelance Talent and Client Success
            </h1>
            <p className="text-lg text-gray-700 mb-6 animate-fade-in-up">
              Discover a world of opportunities and collaborate with top talent.
              Achieve success with ease.
            </p>
            <button className="bg-yellow-400 text-gray-800 px-8 py-4 rounded-full text-lg hover:bg-yellow-500 transition duration-300">
              Get Started Now
            </button>
          </div>
          <div className="w-full md:w-1/2">
            <Image
              src="/images/homepage.jpg"
              width={500}
              height={300}
              alt="Homepage Image"
              className="rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-300"
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Most Popular Services
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto px-6">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <img
                // src={`product-${item}.png`}
                src="/images/product-1.jpg"
                alt={`Product ${item}`}
                className="w-full h-48 object-cover mb-4 rounded-lg transition-transform transform hover:scale-105 duration-300"
              />
              <h3 className="font-semibold mb-2 text-gray-800">
                Website Design and Development
              </h3>
              <p className="text-gray-600 mb-4">
                Creating visually appealing and functional websites through
                aesthetic design and technical coding.
              </p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg text-gray-800">$XX.XX</span>
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-full hover:bg-blue-600 hover:text-white transition duration-300">
            View All Services
          </button>
        </div>
      </section>

      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            We Guarantee
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <img
                  src="/images/mobdev.png"
                  // src={`icon-${item}.png`}
                  alt={`Feature ${item}`}
                  className="w-16 h-16 mx-auto mb-4"
                />
                <h3 className="font-semibold text-lg text-gray-800 mb-2">
                  Mobile Development
                </h3>
                <p className="text-gray-600">
                  Creating applications for smartphones and tablets that are
                  user-friendly and functional.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Awesome Team Members
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto px-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="text-center">
              <img
                src="/images/men.webp"
                // src={`team-${item}.png`}
                alt={`Team Member ${item}`}
                className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-blue-500 transition-transform transform hover:scale-105 duration-300"
              />
              <h3 className="font-semibold text-lg text-gray-800">
                Ayush Mange
              </h3>
              <p className="text-gray-600">Web Developer</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Choose the Plan That Works for You
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {["Basic", "Pro", "Enterprise"].map((plan) => (
            <div
              key={plan}
              className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <h3 className="text-xl font-bold mb-4 text-gray-800">{plan}</h3>
              <p className="text-4xl font-bold text-gray-800 mb-6">
                $10<span className="text-sm font-normal">/month</span>
              </p>
              <ul className="mb-8 text-gray-700">
                <li className="mb-2 flex items-center">
                  <i className="fas fa-check text-green-500 mr-2"></i> Access to
                  browse and select project.
                </li>
                <li className="mb-2 flex items-center">
                  <i className="fas fa-check text-green-500 mr-2"></i> Increased
                  project Visiability and Promotion.
                </li>
                <li className="mb-2 flex items-center">
                  <i className="fas fa-check text-green-500 mr-2"></i> Dedicated
                  Customer Support
                </li>
              </ul>
              <button className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 transition duration-300">
                Choose Plan
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">
            What Our Clients Say
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            "The platform was a game-changer for my business! I found the best
            talent, and the entire process was seamless."
          </p>
          <p className="text-gray-600">— Happy Client</p>
        </div>
      </section>

      <footer className="bg-gray-800 py-6">
        <div className="container mx-auto text-center text-white">
          &copy; {new Date().getFullYear()} Devforge. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
