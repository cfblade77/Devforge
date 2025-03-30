import { useStateProvider } from "../../../context/StateContext";
import { ORDER_DETAILS_ROUTE } from "../../../utils/constants";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { FaCalendar, FaMoneyBillWave, FaFolder, FaUser, FaClock } from "react-icons/fa";
import TabSystem, { TabPanel } from "../../../components/Tabs/TabSystem";
import GitHubSection from "../../../components/GitHub/GitHubSection";
import TaskBoardSection from "../../../components/Tasks/TaskBoardSection";

function OrderDetails() {
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [{ userInfo }] = useStateProvider();
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        const getOrderDetails = async () => {
            try {
                if (!id) return;
                setLoading(true);
                const response = await axios.get(`${ORDER_DETAILS_ROUTE}/${id}`, {
                    withCredentials: true
                });
                setOrderData(response.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || "Failed to load order details");
                setLoading(false);
            }
        };

        if (userInfo && id) {
            getOrderDetails();
        }
    }, [userInfo, id]);

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center flex-col">
                <div className="text-red-500 text-xl mb-4">{error}</div>
                <Link href="/buyer/orders" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Back to Orders
                </Link>
            </div>
        );
    }

    if (!orderData || !orderData.order) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="text-xl">Order not found</div>
            </div>
        );
    }

    const { order, commits } = orderData;

    // Define tabs for the tab system
    const tabs = [
        { id: 'github', title: 'GitHub & Commits' },
        { id: 'tasks', title: 'Task Management' }
    ];

    return (
        <div className="min-h-[80vh] my-10 px-4 md:px-10 lg:px-20 xl:px-32 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Order #{order.id}</h1>
                <Link href="/buyer/orders" className="text-blue-500 hover:text-blue-700">
                    Back to All Orders
                </Link>
            </div>

            {/* Order Details Section */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-semibold mb-4">Order Details</h2>

                <div className="mb-6">
                    <h3 className="text-xl font-medium mb-2">{order.gig.title}</h3>
                    <p className="text-gray-600">{order.gig.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center">
                        <FaFolder className="text-gray-500 mr-2" />
                        <span className="text-gray-700 font-medium">Category:</span>
                        <span className="ml-2">{order.gig.category}</span>
                    </div>

                    <div className="flex items-center">
                        <FaMoneyBillWave className="text-gray-500 mr-2" />
                        <span className="text-gray-700 font-medium">Price:</span>
                        <span className="ml-2">${order.price}</span>
                    </div>

                    <div className="flex items-center">
                        <FaClock className="text-gray-500 mr-2" />
                        <span className="text-gray-700 font-medium">Delivery Time:</span>
                        <span className="ml-2">{order.gig.deliveryTime} days</span>
                    </div>

                    <div className="flex items-center">
                        <FaCalendar className="text-gray-500 mr-2" />
                        <span className="text-gray-700 font-medium">Order Date:</span>
                        <span className="ml-2">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center">
                        <FaUser className="text-gray-500 mr-2" />
                        <span className="text-gray-700 font-medium">Seller:</span>
                        <span className="ml-2">{order.gig.createdBy.fullName || order.gig.createdBy.username}</span>
                    </div>
                </div>
            </div>

            {/* Tab System for GitHub and Tasks */}
            <TabSystem tabs={tabs}>
                <TabPanel tabId="github">
                    <GitHubSection
                        order={order}
                        commits={commits}
                        isUserSeller={false}
                    />
                </TabPanel>

                <TabPanel tabId="tasks">
                    <TaskBoardSection
                        orderId={order.id}
                        sellerId={order.gig.createdBy.id}
                        buyerId={order.buyer.id}
                        isUserSeller={false}
                    />
                </TabPanel>
            </TabSystem>

            {/* Message Link */}
            <div className="mt-8 text-center">
                <Link
                    href={`/buyer/orders/messages/${order.id}`}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg inline-flex items-center"
                >
                    Message Seller
                </Link>
            </div>
        </div>
    );
}

export default OrderDetails; 