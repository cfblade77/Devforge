import React, { useEffect, useState } from "react";
import Link from "next/link";
import { IoSearchOutline } from "react-icons/io5";
import { useRouter } from "next/router";
import Image from "next/image";
import { useCookies } from "react-cookie";
import axios from "axios";
import { GET_USER_INFO, HOST } from "../utils/constants";
import ContextMenu from "./ContextMenu";
import { useStateProvider } from "../context/StateContext";
import { reducerCases } from "../context/constants";

function Navbar() {
  const [cookies] = useCookies();
  const router = useRouter();
  const [navFixed, setNavFixed] = useState(false);
  const [searchData, setSearchData] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [{ showLoginModal, showSignupModal, isSeller, userInfo }, dispatch] =
    useStateProvider();

  const handleLogin = () => {
    if (showSignupModal) {
      dispatch({
        type: reducerCases.TOGGLE_SIGNUP_MODAL,
        showSignupModal: false,
      });
    }
    dispatch({
      type: reducerCases.TOGGLE_LOGIN_MODAL,
      showLoginModal: true,
    });
  };

  const handleSignup = () => {
    if (showLoginModal) {
      dispatch({
        type: reducerCases.TOGGLE_LOGIN_MODAL,
        showLoginModal: false,
      });
    }
    dispatch({
      type: reducerCases.TOGGLE_SIGNUP_MODAL,
      showSignupModal: true,
    });
  };

  const links = [

    { linkName: "Explore", handler: "#", type: "link" },

    { linkName: "Become a Seller", handler: "#", type: "link" },
    { linkName: "Sign in", handler: handleLogin, type: "button" },
    { linkName: "Join", handler: handleSignup, type: "button2" },
  ];
  // ✅ Ensure it runs every time JWT changes

  const handleOrdersNavigate = () => {
    if (isSeller) router.push("/seller/orders");
    router.push("/buyer/orders");
  };

  const handleModeSwitch = () => {
    if (isSeller) {
      dispatch({ type: reducerCases.SWITCH_MODE });
      router.push("/buyer/orders");
    } else {
      dispatch({ type: reducerCases.SWITCH_MODE });
      router.push("/seller");
    }
  };

  // Remove the duplicate useEffect (lines 99-135 in your code)
  // Keep only one useEffect for fetching user info

  // In Navbar.js, modify the useEffect hook
  useEffect(() => {
    // Check for either jwt cookie or auth_status cookie
    const isAuthenticated = cookies.jwt || cookies.auth_status === "authenticated";
    console.log("Authentication status:", isAuthenticated);

    if (isAuthenticated && !userInfo) {
      const getUserInfo = async () => {
        try {
          console.log("Fetching user info...");

          const response = await axios.post(
            GET_USER_INFO,
            {},
            {
              withCredentials: true,
              headers: {
                Authorization: cookies.jwt ? `Bearer ${cookies.jwt}` : undefined,
              },
            }
          );

          if (response.data && response.data.user) {
            let projectedUserInfo = { ...response.data.user };

            // Ensure profile image is always present
            projectedUserInfo.imageName = response.data.user.profileImage ||
              `https://ui-avatars.com/api/?name=${response.data.user.username || 'User'}&background=random`;

            // Ensure username is always present
            projectedUserInfo.username = response.data.user.username || "Anonymous";

            dispatch({
              type: reducerCases.SET_USER,
              userInfo: projectedUserInfo,
            });

            console.log("User Info Set:", projectedUserInfo);
          }
        } catch (err) {
          console.error("Error fetching user info:", err.response?.data || err.message);
          // Handle stale or invalid tokens - don't redirect immediately
          if (err.response?.status === 401 || err.response?.status === 403) {
            console.log("Auth failed, clearing cookies");
            // Just clear the cookies but don't redirect, let the app handle it
            document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "auth_status=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          }
        } finally {
          setIsLoaded(true);
        }
      };

      getUserInfo();
    } else {
      setIsLoaded(true);
    }
  }, [cookies.jwt, cookies.auth_status, userInfo, dispatch]);


  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  useEffect(() => {
    const clickListener = (e) => {
      e.stopPropagation();

      if (isContextMenuVisible) setIsContextMenuVisible(false);
    };
    if (isContextMenuVisible) {
      window.addEventListener("click", clickListener);
    }
    return () => {
      window.removeEventListener("click", clickListener);
    };
  }, [isContextMenuVisible]);
  const ContextMenuData = [
    {
      name: "Profile",
      callback: (e) => {
        e.stopPropagation();

        setIsContextMenuVisible(false);
        router.push("/profile");
      },
    },
    {
      name: "Logout",
      callback: (e) => {
        e.stopPropagation();

        setIsContextMenuVisible(false);
        router.push("/logout");
      },
    },
  ];

  return (
    <>
      {isLoaded && (
        <nav
          className={`w-full px-24 flex justify-between items-center py-6  top-0 z-30 transition-all duration-300 ${navFixed || userInfo
            ? "fixed bg-white border-b border-gray-200"
            : "absolute bg-transparent border-transparent"
            }`}
        >
          <div>
            <Link href="/" className="font-bold text-2xl text-gray-200">
              <h1>
                DevForge
              </h1>

            </Link>
          </div>
          <div
            className={`flex ${navFixed || userInfo ? "opacity-100" : "opacity-0"
              }`}
          >
            <input
              type="text"
              placeholder="What service are you looking for today?"
              className="w-[30rem] py-2.5 px-4 border"
              value={searchData}
              onChange={(e) => setSearchData(e.target.value)}
            />
            <button
              className="bg-gray-900 py-1.5 text-white w-16 flex justify-center items-center"
              onClick={() => {
                setSearchData("");
                router.push(`/search?q=${searchData}`);
              }}
            >
              <IoSearchOutline className="fill-white text-white h-6 w-6" />
            </button>
          </div>
          {!userInfo ? (
            <ul className="flex gap-10 items-center">
              {links.map(({ linkName, handler, type }) => {
                return (
                  <li
                    key={linkName}
                    className={`${navFixed ? "text-black" : "text-white"
                      } font-medium`}
                  >
                    {type === "link" && <Link href={handler}>{linkName}</Link>}
                    {type === "button" && (
                      <button onClick={handler}>{linkName}</button>
                    )}
                    {type === "button2" && (
                      <button
                        onClick={handler}
                        className={`border   text-md font-semibold py-1 px-3 rounded-sm ${navFixed
                          ? "border-[#1DBF73] text-[#1DBF73]"
                          : "border-white text-white"
                          } hover:bg-[#1DBF73] hover:text-white hover:border-[#1DBF73] transition-all duration-500`}
                      >
                        {linkName}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <ul className="flex gap-10 items-center">
              {isSeller && (
                <li
                  className="cursor-pointer text-[#1DBF73] font-medium"
                  onClick={() => router.push("/seller/gigs/create")}
                >
                  Create Gig
                </li>
              )}
              <li
                className="cursor-pointer text-[#1DBF73] font-medium"
                onClick={handleOrdersNavigate}
              >
                Orders
              </li>

              {isSeller ? (
                <li
                  className="cursor-pointer font-medium"
                  onClick={handleModeSwitch}
                >
                  Switch To Buyer
                </li>
              ) : (
                <li
                  className="cursor-pointer font-medium"
                  onClick={handleModeSwitch}
                >
                  Switch To Seller
                </li>
              )}
              <li
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsContextMenuVisible(true);
                }}
                title="Profile"
              >
                {userInfo?.imageName ? (
                  <Image
                    src={userInfo.imageName}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="bg-purple-500 h-10 w-10 flex items-center justify-center rounded-full relative">
                    <span className="text-xl text-white">
                      {userInfo &&
                        userInfo?.email &&
                        userInfo?.email.split("")[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </li>
            </ul>
          )}
          {isContextMenuVisible && <ContextMenu data={ContextMenuData} />}
        </nav>
      )}
    </>
  );
}

export default Navbar;
