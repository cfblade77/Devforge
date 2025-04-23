import Image from "next/image";
import React from "react";

function JoinDevForge() {
  return (
    <div className="mx-32 my-28 relative">
      <div className="absolute z-10 top-1/3 left-12 max-w-md">
        <h4 className="text-white text-5xl font-bold leading-tight mb-8">
          Suddenly it&apos;s all so <i className="text-[#1DBF73]">doable.</i>
        </h4>
        <p className="text-white/90 text-lg mb-10">
          Join thousands of developers building their careers and projects on DevForge.
        </p>
        <button
          className="border text-base font-medium px-8 py-4 bg-[#1DBF73] text-white rounded-md hover:bg-[#19a666] transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          type="button"
        >
          Join DevForge
        </button>
      </div>
      <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10 rounded-xl"></div>
        <Image
          src="/bg-signup.webp"
          fill
          alt="signup"
          className="object-cover hover:scale-105 transition-transform duration-700"
        />
      </div>
    </div>
  );
}

export default JoinDevForge;
