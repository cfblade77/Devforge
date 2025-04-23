import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";

function HomeBanner() {
  const router = useRouter();
  const [searchData, setSearchData] = useState("");

  return (
    <div className="h-[680px] relative bg-cover overflow-hidden">
      <div className="absolute top-0 right-0 w-[110vw] h-full z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d084d]/80 to-transparent z-10"></div>
        <Image
          alt="hero"
          src="/bg-hero2.png"
          fill
          className="object-cover transition-transform duration-700 hover:scale-105"
          priority
        />
      </div>
      <div className="z-10 relative w-[650px] flex justify-center flex-col h-full gap-8 ml-24">
        <h1 className="text-white text-6xl font-bold leading-tight animate-fade-in-up">
          Code. Collaborate.
          <span className="text-[#1DBF73]"> Get Hired.</span>
        </h1>
        <p className="text-white/90 text-xl max-w-[500px]">
          Connect with top developers, collaborate on projects, and build your future in tech.
        </p>
        <div className="flex align-middle">
          <div className="relative w-[450px] shadow-lg">
            <IoSearchOutline className="absolute text-gray-500 text-2xl flex align-middle h-full left-4" />
            <input
              type="text"
              className="h-16 w-full pl-12 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#1DBF73] transition-all"
              placeholder={`Try "building mobile app"`}
              value={searchData}
              onChange={(e) => setSearchData(e.target.value)}
            />
          </div>
          <button
            className="bg-[#1DBF73] text-white px-12 text-lg font-semibold rounded-r-lg h-16 hover:bg-[#19a666] transition-colors duration-300"
            onClick={() => router.push(`/search?q=${searchData}`)}
          >
            Search
          </button>
        </div>
        <div className="text-white flex gap-4 items-center mt-2">
          <span className="text-gray-300">Popular:</span>
          <ul className="flex gap-4 flex-wrap">
            <li
              className="text-sm py-2 px-4 border rounded-full hover:bg-white hover:text-black transition-all duration-300 cursor-pointer"
              onClick={() => router.push("/search?q=website design")}
            >
              Website Design
            </li>
            <li
              className="text-sm py-2 px-4 border rounded-full hover:bg-white hover:text-black transition-all duration-300 cursor-pointer"
              onClick={() => router.push("/search?q=wordpress")}
            >
              Wordpress
            </li>
            <li
              className="text-sm py-2 px-4 border rounded-full hover:bg-white hover:text-black transition-all duration-300 cursor-pointer"
              onClick={() => router.push("/search?q=logo design")}
            >
              Logo Design
            </li>
            <li
              className="text-sm py-2 px-4 border rounded-full hover:bg-white hover:text-black transition-all duration-300 cursor-pointer"
              onClick={() => router.push("/search?q=ai services")}
            >
              AI Services
            </li>
          </ul>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default HomeBanner;
