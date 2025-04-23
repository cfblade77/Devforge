import Image from "next/image";
import React from "react";
import { BsCheckCircle } from "react-icons/bs";

function DevForgeBusiness() {
  const features = [
    "Developer talent matching",
    "Dedicated account management for projects",
    "Seamless team collaboration tools",
    "Streamlined developer payment solutions"
  ];

  return (
    <div className="bg-gradient-to-r from-[#0d084d] to-[#1A0F91] px-24 py-20 flex gap-12">
      <div className="text-white flex flex-col gap-7 justify-center items-start max-w-[600px]">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-white text-3xl font-bold">DevForge</span>
          <span className="bg-white text-[#0d084d] px-3 py-1 rounded-full text-sm font-bold">Business</span>
        </div>

        <h2 className="text-4xl font-bold leading-tight">
          A platform built for <span className="text-[#1DBF73]">developers</span>
        </h2>

        <h4 className="text-xl text-gray-300 font-light">
          Connect with top developers, manage projects efficiently, and scale your tech team with ease.
        </h4>

        <ul className="flex flex-col gap-5 my-4">
          {features.map((feature, index) => (
            <li
              key={index}
              className="flex gap-3 items-center business-feature"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="bg-[#1DBF73] rounded-full p-1.5">
                <BsCheckCircle className="text-white text-lg" />
              </div>
              <span className="text-lg">{feature}</span>
            </li>
          ))}
        </ul>

        <button
          className="mt-4 border text-base font-medium px-8 py-3 bg-[#1DBF73] text-white rounded-md hover:bg-[#19a666] transition-colors duration-300 transform hover:scale-105"
          type="button"
        >
          Explore DevForge Business
        </button>
      </div>

      <div className="relative h-[550px] w-2/5 rounded-lg overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d084d]/30 to-transparent z-10 rounded-lg"></div>
        <Image
          src="/developer-team.webp"
          alt="Developer Team"
          fill
          className="object-cover hover:scale-105 transition-transform duration-700"
        />
      </div>

      <style jsx global>{`
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-15px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .business-feature {
          animation: fadeInLeft 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}

export default DevForgeBusiness;
