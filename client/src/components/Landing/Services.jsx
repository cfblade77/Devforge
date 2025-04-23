import { categories } from "../../utils/categories";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";

function Services() {
  const router = useRouter();

  return (
    <div className="mx-20 my-24">
      <h2 className="text-4xl mb-12 text-[#404145] font-bold text-center relative">
        You need it, we&apos;ve got it
        <span className="block h-1 w-24 bg-[#1DBF73] mt-4 mx-auto"></span>
      </h2>
      <div className="max-w-7xl mx-auto">
        <ul className="grid grid-cols-5 gap-6">
          {categories.map(({ name, logo }, index) => {
            return (
              <li
                key={name}
                className="service-card flex flex-col justify-center items-center cursor-pointer 
                           bg-white rounded-xl shadow-sm hover:shadow-xl border-b-4 border-transparent 
                           hover:border-[#1DBF73] p-8 transition-all duration-300 transform hover:-translate-y-1"
                onClick={() => router.push(`/search?category=${name}`)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="w-16 h-16 flex items-center justify-center mb-4 rounded-full bg-[#f1fdf7] p-3">
                  <Image src={logo} alt={name} height={50} width={50} />
                </div>
                <span className="font-medium text-center text-[#404145]">{name}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .service-card {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}

export default Services;
