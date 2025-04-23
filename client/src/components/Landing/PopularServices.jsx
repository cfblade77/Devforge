import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";

function PopularServices() {
  const router = useRouter();
  const popularServicesData = [
    { name: "Web Development", label: "Modern solutions", image: "/service1.png" },
    { name: "Mobile Development", label: "App innovation", image: "/service2.jpeg" },
    {
      name: "Cloud & DevOps",
      label: "Scale seamlessly",
      image: "/service3.jpeg",
    },
    {
      name: "AI Development",
      label: "Build the future",
      image: "/service4.jpeg",
    },
    {
      name: "Game Development",
      label: "Create experiences",
      image: "/service5.jpeg",
    },
    { name: "AR/VR/XR Development", label: "Immersive worlds", image: "/service6.jpeg" },
    {
      name: "Low-Code/No-Code",
      label: "Build fast",
      image: "/service7.jpeg",
    },
    { name: "UI/UX & Product Design", label: "Beautiful interfaces", image: "/service8.jpeg" },
    { name: "Blockchain Development", label: "Secure solutions", image: "/service8.jpeg" },
  ];

  return (
    <div className="mx-20 my-20 py-10">
      <h2 className="text-4xl mb-8 text-[#404145] font-bold relative">
        Popular Services
        <span className="block h-1 w-20 bg-[#1DBF73] mt-4"></span>
      </h2>
      <ul className="grid grid-cols-3 gap-8">
        {popularServicesData.map(({ name, label, image }) => {
          return (
            <li
              key={name}
              className="relative cursor-pointer rounded-lg overflow-hidden shadow-md group transition-all duration-300 hover:shadow-xl"
              onClick={() => router.push(`/search?q=${name.toLowerCase()}`)}
            >
              <div className="absolute z-10 left-0 top-0 w-full h-full bg-gradient-to-t from-black/70 to-transparent p-6 flex flex-col justify-end">
                <span className="text-[#1DBF73] font-medium mb-1">{label}</span>
                <h6 className="font-bold text-2xl text-white group-hover:text-[#1DBF73] transition-colors duration-300">{name}</h6>
              </div>
              <div className="h-80 w-full">
                <Image
                  src={image}
                  fill
                  alt={name}
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default PopularServices;
