import Image from "next/image";
import React from "react";

function Companies() {
  return (
    <div className="flex items-center justify-center bg-gray-50 py-12 border-t border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between w-full">
        <span className="text-gray-500 text-xl font-medium mb-8 md:mb-0">Trusted by:</span>
        <ul className="flex flex-wrap justify-center md:justify-between gap-10 companies-animation">
          {[1, 2, 3, 4, 5].map((num) => (
            <li 
              key={num} 
              className="relative h-[4.5rem] w-[5.5rem] grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110"
              style={{ animationDelay: `${num * 0.1}s` }}
            >
              <Image src={`/trusted${num}.png`} alt="trusted brands" fill className="object-contain" />
            </li>
          ))}
        </ul>
      </div>
      
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .companies-animation > li {
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}

export default Companies;
