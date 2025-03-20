import { useStateProvider } from "../../../context/StateContext";
import { GET_SELLER_ORDERS_ROUTE, CREATE_GITHUB_REPO_ROUTE } from "../../../utils/constants";
import axios from "axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [{ userInfo }] = useStateProvider();

  const getOrders = async () => {
    try {
      const {
        data: { orders },
      } = await axios.get(GET_SELLER_ORDERS_ROUTE, { withCredentials: true });
      setOrders(orders);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (userInfo) getOrders();
  }, [userInfo]);

  // Creates or refreshes a GitHub repository for an order
  const handleCreateRepo = async (orderId) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${CREATE_GITHUB_REPO_ROUTE}/${orderId}`,
        {},
        { withCredentials: true }
      );

      if (response.status === 200) {
        // Refresh orders list to show the new repo
        await getOrders();
        alert("GitHub repository created successfully!");
      }
    } catch (error) {
      console.error("Error creating repository:", error);
      alert(error.response?.data?.message || "Failed to create GitHub repository");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] my-10 mt-0 px-32">
      <h3 className="m-5 text-2xl font-semibold">All your Orders</h3>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Order Id
              </th>
              <th scope="col" className="px-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3">
                Category
              </th>
              <th scope="col" className="px-6 py-3">
                Price
              </th>
              <th scope="col" className="px-6 py-3">
                Delivery Time
              </th>
              <th scope="col" className="px-6 py-3">
                Ordered By
              </th>
              <th scope="col" className="px-6 py-3">
                Order Date
              </th>
              <th scope="col" className="px-6 py-3">
                GitHub Repo
              </th>
              <th scope="col" className="px-6 py-3">
                Details
              </th>
              <th scope="col" className="px-6 py-3">
                Send Message
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              return (
                <tr
                  className="bg-white dark:bg-gray-800 hover:bg-gray-50"
                  key={order.id}
                >
                  <th scope="row" className="px-6 py-4 ">
                    {order.id}
                  </th>
                  <th scope="row" className="px-6 py-4 font-medium">
                    {order.gig.title}
                  </th>
                  <td className="px-6 py-4">{order.gig.category}</td>
                  <td className="px-6 py-4">${order.price}</td>
                  <td className="px-6 py-4">{order.gig.deliveryTime} days</td>
                  <td className="px-6 py-4">
                    {order.buyer.fullName || order.buyer.username}
                  </td>
                  <td className="px-6 py-4">{order.createdAt.split("T")[0]}</td>

                  <td className="px-6 py-4">
                    {order.githubRepoUrl ? (
                      <a
                        href={order.githubRepoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline flex items-center"
                      >
                        <FaGithub className="mr-1" /> View Repository
                      </a>
                    ) : (
                      <button
                        onClick={() => handleCreateRepo(order.id)}
                        disabled={isLoading}
                        className="bg-gray-800 text-white px-2 py-1 rounded flex items-center text-xs"
                      >
                        <FaGithub className="mr-1" />
                        {isLoading ? "Creating..." : "Create Repo"}
                      </button>
                    )}
                  </td>

                  <td className="px-6 py-4 ">
                    <Link
                      href={`/seller/orders/${order.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      View Details
                    </Link>
                  </td>

                  <td className="px-6 py-4 ">
                    <Link
                      href={`/seller/orders/messages/${order.id}`}
                      className="font-medium text-blue-600  hover:underline"
                    >
                      Send
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Orders;
