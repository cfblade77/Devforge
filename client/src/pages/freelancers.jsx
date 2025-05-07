import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { HOST } from '../utils/constants';
import FreelancerCard from '../components/FreelancerCard';
import { FaSearch } from 'react-icons/fa';
import ProfileSearchChatbot from '../components/search/ProfileSearchChatbot';

function Freelancers() {
    const [freelancers, setFreelancers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredFreelancers, setFilteredFreelancers] = useState([]);
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const getFreelancers = async () => {
            try {
                const response = await axios.get(`${HOST}/api/users/freelancers`);
                setFreelancers(response.data.freelancers);
                setFilteredFreelancers(response.data.freelancers);
            } catch (error) {
                console.error('Error fetching freelancers:', error);
            } finally {
                setLoading(false);
            }
        };

        const getUserInfo = async () => {
            try {
                const token = localStorage.getItem('devforge-token');
                if (token) {
                    const response = await axios.get(`${HOST}/api/users/me`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setUserInfo(response.data.user);
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
                // Continue showing the page even if user info fetch fails
            }
        };

        getFreelancers();
        getUserInfo();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const filtered = freelancers.filter(freelancer =>
                freelancer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                freelancer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                freelancer.profileGig?.skills?.some(skill =>
                    skill.toLowerCase().includes(searchTerm.toLowerCase())
                ) ||
                freelancer.profileGig?.codingLanguages?.some(lang =>
                    lang.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
            setFilteredFreelancers(filtered);
        } else {
            setFilteredFreelancers(freelancers);
        }
    }, [searchTerm, freelancers]);

    return (
        <div className="min-h-[80vh] px-32 py-10">
            <div className="mb-10">
                <h1 className="text-4xl font-bold mb-6">Find the Perfect Developer</h1>
                <div className="flex items-center gap-4 max-w-2xl">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search by name, skills, or programming languages..."
                            className="w-full px-4 py-3 pl-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1DBF73] focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="loader"></div>
                </div>
            ) : filteredFreelancers.length === 0 ? (
                <div className="text-center py-10">
                    <h2 className="text-2xl font-semibold text-gray-600">No freelancers found</h2>
                    {searchTerm && (
                        <p className="text-gray-500 mt-2">
                            Try adjusting your search terms or clear the search
                        </p>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFreelancers.map((freelancer) => (
                        <FreelancerCard key={freelancer.id} freelancer={freelancer} />
                    ))}
                </div>
            )}
            <ProfileSearchChatbot userInfo={userInfo} />
        </div>
    );
}

export default Freelancers;