import AuthWrapper from "../components/AuthWrapper";
import Everything from "../components/Landing/Everything";
import DevForgeBusiness from "../components/Landing/FiverrBusiness";
import HeroBanner from "../components/Landing/HeroBanner";
import PopularServices from "../components/Landing/PopularServices";
import Services from "../components/Landing/Services";
import { useStateProvider } from "../context/StateContext";
import React from "react";

function Index() {
  const [{ showLoginModal, showSignupModal }] = useStateProvider();

  return (
    <div>
      <HeroBanner />
      <PopularServices />
      <Everything />
      <Services />
      <DevForgeBusiness />
      {(showLoginModal || showSignupModal) && (
        <AuthWrapper type={showLoginModal ? "login" : "signup"} />
      )}
    </div>
  );
}

export default Index;
