import { useRouter } from "next/router";
import React from "react";

function ContextMenu({ data }) {
  const router = useRouter();
  return (
    <div
      className={`z-10  bg-white divide-y divide-gray-100  shadow-2xl border w-44 dark:bg-gray-700
      fixed right-5 top-20 
      `}
    >
      <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
        {data.map(({ name, callback, disabled, className }, index) => {
          return (
            <li
              key={index}
              onClick={disabled ? undefined : callback}
              className={`block px-4 py-2 ${disabled
                  ? "text-gray-400 cursor-default"
                  : "hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
                } ${className || ""}`}
            >
              {name}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ContextMenu;
