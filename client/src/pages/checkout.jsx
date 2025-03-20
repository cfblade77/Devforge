// @ts-nocheck
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { CREATE_ORDER, ORDER_SUCCESS_ROUTE } from "../utils/constants";
import CheckoutForm from "../components/CheckoutForm";
import { useRouter } from "next/router";

function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isProcessingRef = useRef(false);
  const router = useRouter();
  const { gigId } = router.query;

  useEffect(() => {
    const createOrder = async () => {
      // Guard against multiple simultaneous calls
      if (!gigId || orderId || isProcessingRef.current) return;

      // Set processing flag to prevent duplicate calls
      isProcessingRef.current = true;

      try {
        setLoading(true);
        setError("");

        console.log("Starting direct order creation for gig:", gigId);

        const { data } = await axios.post(
          CREATE_ORDER,
          { gigId },
          { withCredentials: true }
        );

        // Save the order ID
        setOrderId(data.orderId);
        console.log("Order created with ID:", data.orderId);

        // Generate a mock payment ID
        const mockPaymentId = `mock_pi_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;

        // Set mock client secret for compatibility
        setClientSecret(mockPaymentId);

      } catch (err) {
        console.error("Error creating order:", err);
        setError(err.response?.data?.message ||
          "Failed to create order. Please try again or contact support.");

        // If there's a redirect URL, use it
        if (err.response?.data?.redirectUrl) {
          router.push(err.response.data.redirectUrl);
        }

        // Reset processing flag on error so user can try again
        isProcessingRef.current = false;
      } finally {
        setLoading(false);
      }
    };

    if (gigId && !orderId && !isProcessingRef.current) {
      createOrder();
    }
  }, [gigId, router, orderId]);

  // Update URL with orderId
  useEffect(() => {
    if (orderId) {
      const url = new URL(window.location.href);
      url.searchParams.set('orderId', orderId);
      window.history.replaceState({}, '', url);
    }
  }, [orderId]);

  // Option to complete order immediately
  const handleDirectCompletion = async () => {
    try {
      setLoading(true);

      if (!orderId) {
        throw new Error("Order ID not found");
      }

      // Generate a mock payment ID
      const mockPaymentId = `mock_pi_direct_${Date.now()}`;

      // Call the order confirmation endpoint directly
      const response = await axios.put(
        ORDER_SUCCESS_ROUTE,
        {
          paymentIntent: mockPaymentId,
          orderId: orderId
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Redirect to orders page
        router.push("/buyer/orders");
      } else {
        throw new Error(response.data.message || "Order confirmation failed");
      }
    } catch (err) {
      console.error("Error with direct completion:", err);
      setError(err.response?.data?.message || err.message || "Failed to complete order");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-[80vh] max-w-full mx-20 flex flex-col gap-10 items-center justify-center">
        <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700 max-w-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button
            onClick={() => {
              // Reset processing flag to allow retry
              isProcessingRef.current = false;
              router.back();
            }}
            className="mt-4 bg-red-100 hover:bg-red-200 text-red-800 py-2 px-4 rounded transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] max-w-full mx-20 flex flex-col gap-10 items-center justify-center">
      <div className="flex flex-col gap-8">
        <h1 className="text-4xl text-center">Complete Your Order</h1>
        {loading ? (
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-12 w-12 bg-green-200 rounded-full"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
        ) : (
          <>
            {orderId ? (
              <div className="flex flex-col gap-6 items-center">
                <div className="bg-white p-8 rounded-lg shadow-md w-[500px]">
                  <h2 className="text-2xl font-semibold mb-4">Order #{orderId}</h2>
                  <p className="mb-6 text-gray-600">
                    Your order has been created. Click below to complete it.
                  </p>

                  <button
                    onClick={handleDirectCompletion}
                    disabled={loading}
                    className="w-full bg-[#1DBF73] text-white font-semibold py-3 px-6 rounded transition-colors hover:bg-[#19a364] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      "Complete Order"
                    )}
                  </button>
                </div>

                <p className="text-gray-500 text-sm max-w-lg text-center">
                  Clicking "Complete Order" will finalize your purchase and a GitHub
                  repository will be automatically created by the seller.
                </p>
              </div>
            ) : (
              <CheckoutForm orderId={orderId} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Checkout;
