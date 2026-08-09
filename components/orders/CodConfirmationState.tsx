"use client";

import React, { useState } from "react";
import type { Order } from "@/lib/orders/types";

export type CodConfirmationStateProps = {
  order: Order;
  confirmationToken?: string;
  onStatusUpdated?: () => void;
};

export function CodConfirmationState({ order, confirmationToken, onStatusUpdated }: CodConfirmationStateProps) {
  const [otpInput, setOtpInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async () => {
    if (!confirmationToken) {
      setError("Confirmation token missing. Refresh session.");
      return;
    }
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/orders/cod/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, confirmationToken }),
      });
      const json = await res.json();
      if (res.ok) {
        setMessage("OTP sent successfully to your registered mobile number.");
      } else {
        setError(json.details || json.error || "Failed to send OTP.");
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmationToken || !otpInput) {
      setError("Please enter OTP and ensure session is valid.");
      return;
    }
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/orders/cod/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, confirmationToken, otp: otpInput }),
      });
      const json = await res.json();
      if (res.ok) {
        setMessage("OTP verified successfully!");
        if (onStatusUpdated) onStatusUpdated();
      } else {
        setError(json.error || "Failed to verify OTP.");
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const codStatus = order.codStatus || "COD_PENDING_CONFIRMATION";

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-6 max-w-xl mx-auto my-6 text-neutral-200 font-sans">
      <div className="border-b border-neutral-800 pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Order #{order.id} Status</h2>
        <p className="text-xs text-neutral-400 font-mono uppercase mt-1">Payment Method: Cash on Delivery</p>
      </div>

      {message && <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-sm rounded">{message}</div>}
      {error && <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-sm rounded">{error}</div>}

      {/* State Render Matrix */}
      {codStatus === "COD_PENDING_CONFIRMATION" && (
        <div className="space-y-4">
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded text-sm text-neutral-300">
            <p className="font-semibold text-white mb-1">Order Received — Pending Verification</p>
            <p>Your order has been recorded. Complete OTP verification to submit your Cash on Delivery order.</p>
          </div>
          <button
            onClick={handleSendOtp}
            disabled={loading}
            className="w-full py-2.5 bg-neutral-100 text-neutral-900 hover:bg-white font-medium text-sm rounded transition"
          >
            {loading ? "Sending OTP..." : "Send Verification OTP"}
          </button>
        </div>
      )}

      {codStatus === "COD_OTP_PENDING" && (
        <div className="space-y-4">
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded text-sm text-neutral-300">
            <p className="font-semibold text-white mb-1">Verification OTP Sent</p>
            <p>Enter the 6-digit OTP sent to {order.customer?.phone || "your phone"}.</p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              placeholder="123456"
              className="flex-1 px-4 py-2 bg-neutral-950 border border-neutral-700 text-white font-mono rounded text-center tracking-widest text-lg"
            />
            <button
              onClick={handleVerifyOtp}
              disabled={loading || otpInput.length < 6}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded transition disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </div>
          <div className="text-right">
            <button onClick={handleSendOtp} disabled={loading} className="text-xs text-neutral-400 hover:text-white underline">
              Resend OTP
            </button>
          </div>
        </div>
      )}

      {codStatus === "COD_ADVANCE_REQUIRED" && (
        <div className="p-4 bg-amber-950/30 border border-amber-800/80 rounded text-sm text-amber-200 space-y-2">
          <p className="font-semibold text-white">Booking Advance Payment Required</p>
          <p>A partial booking advance of ₹{(order.advanceAmountPaise || 20000) / 100} is required to confirm this COD order.</p>
        </div>
      )}

      {codStatus === "COD_HELD" && (
        <div className="p-4 bg-neutral-950 border border-neutral-800 rounded text-sm text-neutral-400 space-y-1">
          <p className="font-semibold text-white">Order Under Manual Review</p>
          <p>Our team is verifying your shipping address and contact info. You will be notified shortly.</p>
        </div>
      )}

      {codStatus === "COD_PREPAID_ONLY" && (
        <div className="p-4 bg-red-950/30 border border-red-800/80 rounded text-sm text-red-200 space-y-2">
          <p className="font-semibold text-white">Prepaid Payment Required</p>
          <p>Cash on Delivery is unavailable for this order. Please switch to online prepaid checkout.</p>
        </div>
      )}

      {codStatus === "COD_APPROVED" && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800 rounded text-sm text-emerald-200 space-y-1">
          <p className="font-semibold text-white text-base">Cash on Delivery Approved</p>
          <p>Your Cash on Delivery order is approved. Fulfilment will proceed through our order-processing workflow.</p>
        </div>
      )}
    </div>
  );
}
