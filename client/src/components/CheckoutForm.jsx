import React, { useState } from "react";

export default function CheckoutForm({ orderId }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    // Check if e is an event object to prevent TypeError
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Generate a mock payment ID
      const mockPaymentId = `mock_pi_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;

      // Redirect to success page with the mock payment ID
      const successUrl = new URL(`${window.location.origin}/success`);
      successUrl.searchParams.set('payment_intent', mockPaymentId);

      if (orderId) {
        successUrl.searchParams.set('orderId', orderId);
      }

      window.location.href = successUrl.toString();
      return;
    } catch (e) {
      console.error("Order submission error:", e);
      setMessage("Failed to create order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form id="order-form" onSubmit={handleSubmit} className="w-96">
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1DBF73] focus:border-[#1DBF73]"
          placeholder="Enter your email"
        />
      </div>

      <div className="bg-green-50 p-4 rounded-md border border-green-200 my-4">
        <p className="text-green-700 font-medium">Direct Order Creation</p>
        <p className="text-sm text-green-600 mt-1">
          Click below to place your order directly without payment processing.
        </p>
      </div>

      <button
        disabled={isLoading}
        id="submit"
        className="border text-lg font-semibold px-5 py-3 border-[#1DBF73] bg-[#1DBF73] text-white rounded-md mt-5 w-full transition-opacity disabled:opacity-70"
        onClick={handleSubmit}
      >
        <span id="button-text">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Processing...</span>
            </div>
          ) : (
            "Place Order"
          )}
        </span>
      </button>

      {/* Show any error or success messages */}
      {message && (
        <div id="order-message" className={`mt-4 p-3 rounded-md ${message.includes("success")
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-red-50 text-red-700 border border-red-200"
          }`}>
          {message}
        </div>
      )}
    </form>
  );
}
