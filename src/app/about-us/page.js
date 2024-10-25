import React from "react";

export default function page() {
  return (
    <div className="font-sans">
      <header className="bg-white py-4 px-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">DevForge</div>
        <nav className="hidden md:flex space-x-6">
          <a href="#" className="text-gray-600 hover:text-blue-600">
            Home
          </a>
          <a href="#" className="text-gray-600 hover:text-blue-600">
            Project
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
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search"
            className="hidden md:block border rounded-lg px-3 py-1"
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            Sign Up
          </button>
        </div>
      </header>

      <main>
        <section className="bg-gray-100 py-16 px-6 md:px-12 lg:px-24">
          <h1 className="text-4xl font-bold mb-8">About Us</h1>
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <img
                src="images/abtus.jpg"
                alt="A person smiling next to chat bubbles"
                className="w-full rounded-lg"
              />
            </div>
            <div className="md:w-1/2 md:pl-12">
              <h2 className="text-2xl font-bold mb-6">Our Vision</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                    1
                  </div>
                  <p>
                    Our vision is to empower individuals and businesses to
                    achieve their goals through innovative digital solutions.
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                    2
                  </div>
                  <p>
                    We strive to create a world where digital tools are
                    accessible and easy to use for everyone, regardless of their
                    background.
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                    3
                  </div>
                  <p>
                    Our goal is to create a digital future that's user-friendly,
                    efficient, and drives positive change in people's lives and
                    businesses.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 md:px-12 lg:px-24">
          <h2 className="text-3xl font-bold mb-8">Our Mission</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mb-4">
                1
              </div>
              <p>
                To provide innovative and scalable solutions that empower
                businesses to thrive in the digital landscape.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mb-4">
                2
              </div>
              <p>
                We are committed to delivering exceptional service and fostering
                long-term partnerships with our clients.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mb-4">
                3
              </div>
              <p>
                Our team is dedicated to continuous learning and staying at the
                forefront of technological advancements to provide cutting-edge
                solutions.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-gray-100 py-16 px-6 md:px-12 lg:px-24">
          <h2 className="text-3xl font-bold mb-8">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "fa-lightbulb",
                title: "Integrity",
                description:
                  "We conduct our business with the highest standards of ethics and transparency.",
              },
              {
                icon: "fa-rocket",
                title: "Innovation",
                description:
                  "We're always looking for new and creative ways to solve problems and improve our services.",
              },
              {
                icon: "fa-users",
                title: "Customer Focus",
                description:
                  "Our customers are at the heart of everything we do. We strive to exceed their expectations.",
              },
              {
                icon: "fa-handshake",
                title: "Collaboration",
                description:
                  "We believe in the power of teamwork and partner with our clients to achieve shared goals.",
              },
              {
                icon: "fa-chart-line",
                title: "Continuous Improvement",
                description:
                  "We are committed to ongoing learning and enhancing our skills and capabilities.",
              },
              {
                icon: "fa-gem",
                title: "Quality",
                description:
                  "We take pride in delivering high-quality solutions that stand the test of time.",
              },
              {
                icon: "fa-heart",
                title: "Passion",
                description:
                  "We are passionate about technology and its potential to transform businesses and lives.",
              },
              {
                icon: "fa-globe",
                title: "Sustainability",
                description:
                  "We are committed to sustainable practices and minimizing our environmental impact.",
              },
            ].map((value, index) => (
              <div key={index} className="text-center">
                <i
                  className={`fas ${value.icon} text-4xl text-blue-600 mb-4`}
                ></i>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16 px-6 md:px-12 lg:px-24">
          <h2 className="text-3xl font-bold mb-8">Highlights and Milestones</h2>
          <div className="space-y-6">
            {[
              "Launched our first product, revolutionizing the way businesses manage their digital presence.",
              "Expanded our team to over 100 talented professionals from diverse backgrounds.",
              "Opened new offices in major tech hubs across the globe.",
              "Achieved significant milestones in client satisfaction and retention rates.",
              "Introduced groundbreaking AI-powered features to our flagship product.",
              "Received multiple industry awards for innovation and excellence in service delivery.",
            ].map((milestone, index) => (
              <div key={index} className="flex items-start">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                  {index + 1}
                </div>
                <p>{milestone}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16 px-6 md:px-12 lg:px-24">
          <div className="flex flex-wrap justify-center items-center gap-8">
            {[
              "logo1.png",
              "logo2.png",
              "logo3.png",
              "logo4.png",
              "logo5.png",
            ].map((logo, index) => (
              <img
                key={index}
                src="images/partner.jpg"
                // src={`/path-to-${logo}`}
                alt={`Partner logo ${index + 1}`}
                className="h-12 opacity-50 hover:opacity-100 transition-opacity"
              />
            ))}
          </div>
        </section>

        <section className="bg-gray-100 py-16 px-6 md:px-12 lg:px-24">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <img
                src="/path-to-team-image.jpg"
                alt="Our team collaborating"
                className="w-full rounded-lg"
              />
            </div>
            <div className="md:w-1/2 md:pl-12">
              <h2 className="text-3xl font-bold mb-6">
                Contact us today to learn more about our services and how we can
                help you!
              </h2>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
                Contact Us
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-blue-600 text-white py-12 px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg" />
      </footer>
    </div>
  );
}
