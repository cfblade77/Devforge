import Image from "next/image";
import React from "react";
import { BsCheckCircle } from "react-icons/bs";

function Everything() {
  const everythingData = [
    {
      title: "Stick to your budget",
      subtitle:
        "Find the right service for every price point. No hourly rates, just project-based pricing.",
    },
    {
      title: "Get quality work done quickly",
      subtitle:
        "Hand your project over to a talented freelancer in minutes, get long-lasting results.",
    },
    {
      title: "Pay when you're happy",
      subtitle:
        "Upfront quotes mean no surprises. Payments only get released when you approve.",
    },
    {
      title: "Count on 24/7 support",
      subtitle:
        "Our round-the-clock support team is available to help anytime, anywhere.",
    },
  ];

  return (
    <div className="bg-gradient-to-r from-[#f1fdf7] to-[#e4f5ed] flex py-24 justify-between px-24">
      <div className="max-w-[600px]">
        <h2 className="text-4xl mb-10 text-[#404145] font-bold relative">
          The best part? Everything.
          <span className="block h-1 w-20 bg-[#1DBF73] mt-4"></span>
        </h2>
        <ul className="flex flex-col gap-8">
          {everythingData.map(({ title, subtitle }, index) => {
            return (
              <li key={title} className="feature-card" style={{ animationDelay: `${index * 0.15}s` }}>
                <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-[#1DBF73]">
                  <div className="flex gap-3 items-center text-xl mb-3">
                    <BsCheckCircle className="text-[#1DBF73] text-2xl" />
                    <h4 className="font-bold text-[#404145]">{title}</h4>
                  </div>
                  <p className="text-[#62646a] pl-9">{subtitle}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="relative h-[500px] w-2/5 rounded-lg overflow-hidden shadow-2xl">
        <Image
          src="/everything.webp"
          fill
          alt="everything"
          className="object-cover hover:scale-105 transition-transform duration-700"
        />
      </div>

      <style jsx global>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .feature-card {
          animation: slideInRight 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}

export default Everything;
