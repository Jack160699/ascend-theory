/** Client-safe payment availability (public env vars only). */

export function isStripeEnabledClient(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}

export function isRazorpayEnabledClient(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
}

export function isOnlinePaymentAvailableClient(): boolean {
  return isStripeEnabledClient() || isRazorpayEnabledClient();
}
