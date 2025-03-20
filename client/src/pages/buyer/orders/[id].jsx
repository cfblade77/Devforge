import { useStateProvider } from "../../../context/StateContext";
import { ORDER_DETAILS_ROUTE } from "../../../utils/constants";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { FaGithub, FaCalendar, FaMoneyBillWave, FaFolder, FaUser, FaClock } from "react-icons/fa";

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

    return (
        <div className="min-h-[80vh] my-10 px-4 md:px-10 lg:px-20 xl:px-32 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Order #{order.id}</h1>
                <Link href="/buyer/orders" className="text-blue-500 hover:text-blue-700">
                    Back to All Orders
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Order Details Section */}
                <div className="lg:col-span-2 bg-white shadow-md rounded-lg p-6">
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

                    {/* GitHub Repository Section */}
                    <div className="border-t pt-4">
                        <h3 className="text-lg font-medium mb-2">GitHub Repository</h3>
                        {order.githubRepoUrl ? (
                            <a
                                href={order.githubRepoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                            >
                                <FaGithub className="mr-2" /> View Repository
                            </a>
                        ) : (
                            <p className="text-gray-500">GitHub repository not available for this order</p>
                        )}
                    </div>
                </div>

                {/* Commits History Section */}
                <div className="lg:col-span-1 bg-white shadow-md rounded-lg p-6 h-fit">
                    <h2 className="text-2xl font-semibold mb-4">Commits History</h2>

                    {commits && commits.length > 0 ? (
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                            {commits.map((commit) => (
                                <div key={commit.sha} className="border-b pb-3">
                                    <div className="flex items-start mb-1">
                                        {commit.avatar_url && (
                                            <img
                                                src={commit.avatar_url}
                                                alt={commit.author}
                                                className="w-8 h-8 rounded-full mr-2"
                                            />
                                        )}
                                        <div>
                                            <p className="font-medium">{commit.author}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(commit.date).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="mt-1 text-gray-700">{commit.message}</p>
                                    <a
                                        href={commit.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 text-sm hover:underline mt-1 inline-block"
                                    >
                                        View commit
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No commits available for this repository</p>
                    )}
                </div>
            </div>

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