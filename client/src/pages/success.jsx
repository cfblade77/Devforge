import { ORDER_SUCCESS_ROUTE } from "../utils/constants";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

function Success() {
  const router = useRouter();
  const { payment_intent, orderId } = router.query;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    const changeOrderStatus = async () => {
      // Skip if already confirmed
      if (orderConfirmed) {
        console.log("Order already confirmed, skipping confirmation request");
        return;
      }

      try {
        setLoading(true);
        if (!payment_intent) {
          throw new Error("Payment intent not found in URL");
        }

        // Check if it's a mock payment
        const isMockPayment = payment_intent.startsWith('mock_pi_');
        console.log(`Processing ${isMockPayment ? 'mock' : 'real'} payment: ${payment_intent}`);
        console.log(`Order ID: ${orderId || 'Not available'}`);

        // Add orderId to the request if available
        const response = await axios.put(
          ORDER_SUCCESS_ROUTE,
          {
            paymentIntent: payment_intent,
            orderId: orderId // Include order ID if available
          },
          { withCredentials: true }
        );

        if (response.data.success) {
          // Mark as confirmed so we don't try again if this component re-renders
          setOrderConfirmed(true);
          console.log("Order confirmed successfully:", response.data);

          // After successful confirmation, redirect after a delay
          setTimeout(() => router.push("/buyer/orders"), 2000);
        } else {
          throw new Error(response.data.message || "Order confirmation returned without success status");
        }
      } catch (err) {
        console.error("Error confirming order:", err);

        // Show error message
        const errorMessage = err.response?.data?.message || err.message ||
          "Failed to confirm your order. Please contact support.";
        setError(errorMessage);

        // Retry logic for transient errors
        if (retryCount < maxRetries) {
          console.log(`Retrying order confirmation (${retryCount + 1}/${maxRetries})...`);
          setRetryCount(prev => prev + 1);
          setTimeout(() => changeOrderStatus(), 2000); // Retry after 2 seconds
        } else {
          console.error("Max retries reached for order confirmation");
        }
      } finally {
        setLoading(false);
      }
    };

    if (payment_intent && router.isReady && !orderConfirmed) {
      changeOrderStatus();
    } else if (router.isReady && !payment_intent) {
      setError("Payment information not found. Please try your purchase again.");
      setLoading(false);
    }
  }, [payment_intent, orderId, router, orderConfirmed, retryCount]);

  const handleManualRedirect = () => {
    router.push("/buyer/orders");
  };

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center px-20 pt-20 flex-col justify-center">
        <div className="bg-red-50 p-6 rounded-md border border-red-200 text-red-700 max-w-2xl text-center">
          <h1 className="text-2xl font-bold mb-4">Payment Error</h1>
          <p className="mb-6">{error}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
            >
              Return Home
            </button>
            <button
              onClick={() => router.push("/buyer/orders")}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              View Orders
            </button>
          </div>
          <p className="mt-6 text-sm text-gray-600">
            Note: Your order may have been created despite this error. Please check your orders page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center px-20 pt-20 flex-col justify-center">
      <div className="bg-green-50 p-6 rounded-md border border-green-200 text-green-700 max-w-2xl text-center">
        <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
        <p className="mb-6">
          {loading
            ? "Processing your order..."
            : "Your order has been confirmed and is now being processed."}
        </p>
        <div className="mb-6">
          {loading ? (
            <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
          ) : (
            <svg
              className="w-16 h-16 mx-auto text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
        <p className="text-sm mb-6">
          {orderConfirmed
            ? "You will be redirected to your orders page in a moment."
            : "Confirming your order..."}
        </p>
        <button
          onClick={handleManualRedirect}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-colors"
          disabled={loading}
        >
          {loading ? "Please wait..." : "View Your Orders"}
        </button>
      </div>
    </div>
  );
}

export default Success;
