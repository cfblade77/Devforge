import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";

function PopularServices() {
  const router = useRouter();
  const popularServicesData = [
    { name: "Web Development", label: "", image: "/service1.png" },
    { name: "Mobile Development", label: "", image: "/service2.jpeg" },
    {
      name: "Cloud & DevOps",
      label: "",
      image: "/service3.jpeg",
    },
    {
      name: "Ai development",
      label: "Share your message",
      image: "/service4.jpeg",
    },
    {
      name: "Game Development",
      label: "Reach more customers",
      image: "/service5.jpeg",
    },
    { name: "AR/VR/XR Development", label: "Unlock growth online", image: "/service6.jpeg" },
    {
      name: "Low-Code/No-Code Development",
      label: "Color your dreams",
      image: "/service7.jpeg",
    },
    { name: "UI/UX & Product Design", label: "Go global", image: "/service8.jpeg" },
    { name: "Blockchain Development", label: "Go global", image: "/service8.jpeg" },
  ];
  return (
    <div className="mx-20 my-16">
      <h2 className="text-4xl mb-5 text-[#404145] font-bold">
        Popular Services
      </h2>
      <ul className="flex flex-wrap gap-16">
        {popularServicesData.map(({ name, label, image }) => {
          return (
            <li
              key={name}
              className="relative cursor-pointer"
              onClick={() => router.push(`/search?q=${name.toLowerCase()}`)}
            >
              <div className="absolute z-10 text-white left-5 top-4">
                <span>{label}</span>
                <h6 className="font-extrabold text-2xl">{name}</h6>
              </div>
              <div className="h-80 w-72 ">
                <Image src={image} fill alt="service" />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default PopularServices;
