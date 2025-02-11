import Image from "next/image";
import React from "react";
import { BsCheckCircle } from "react-icons/bs";

function DevForgeBusiness() {
  return (
    <div className="bg-[#0d084d] px-20 py-16 flex gap-10">
      <div className="text-white flex flex-col gap-6 justify-center items-start">
        <div className="flex gap-2">
          <span className="text-white text-3xl font-bold">DevForge</span>
        </div>
        <h2 className="text-3xl font-bold">A platform built for developers</h2>
        <h4 className="text-xl">
          Connect with top developers, manage projects efficiently, and scale your tech team with ease.
        </h4>
        <ul className="flex flex-col gap-4">
          <li className="flex gap-2 items-center">
            <BsCheckCircle className="text-[#62646a] text-2xl" />
            <span>Developer talent matching</span>
          </li>
          <li className="flex gap-2 items-center">
            <BsCheckCircle className="text-[#62646a] text-2xl" />
            <span>Dedicated account management for projects</span>
          </li>
          <li className="flex gap-2 items-center">
            <BsCheckCircle className="text-[#62646a] text-2xl" />
            <span>Seamless team collaboration tools</span>
          </li>
          <li className="flex gap-2 items-center">
            <BsCheckCircle className="text-[#62646a] text-2xl" />
            <span>Streamlined developer payment solutions</span>
          </li>
        </ul>
        <button
          className="border text-base font-medium px-5 py-2   border-[#1DBF73] bg-[#1DBF73] text-white rounded-md"
          type="button"
        >
          Explore DevForge Business
        </button>
      </div>
      <div className="relative h-[512px] w-2/3">
        <Image src="/developer-team.webp" alt="Developer Team" fill />
      </div>
    </div>
  );
}

export default DevForgeBusiness;
