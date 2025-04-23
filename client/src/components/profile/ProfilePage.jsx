import React, { useEffect } from "react";
import { useStateProvider } from "../../context/StateContext";
import FreelancerProfile from "./FreelancerProfile";
import ClientProfile from "./ClientProfile";

function ProfilePage() {
    const [{ userInfo }] = useStateProvider();

    // Render the appropriate profile component based on the user type
    return (
        <div>
            {userInfo?.isFreelancer ? (
                <FreelancerProfile userInfo={userInfo} />
            ) : (
                <ClientProfile userInfo={userInfo} />
            )}
        </div>
    );
}

export default ProfilePage; 