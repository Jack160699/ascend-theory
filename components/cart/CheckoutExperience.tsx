"use client";

import { useCart } from "@/contexts/cart";
import { formatMoney, formatOrderWhatsAppBody } from "@/lib/cart/format";
import { ascendWhatsAppUrl } from "@/lib/whatsapp";
import { event } from "@/lib/fpixel";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { CartTrust } from "./CartTrust";
import { CartUrgency } from "./CartUrgency";

export function CheckoutExperience() {
  const router = useRouter();
  const { resolvedLines, subtotal, currency, hydrated, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const checkoutTracked = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    if (resolvedLines.length === 0) {
      router.replace("/drop/ascend-01");
    }
  }, [hydrated, resolvedLines.length, router]);

  useEffect(() => {
    if (!hydrated || resolvedLines.length === 0 || checkoutTracked.current) return;
    checkoutTracked.current = true;
    event("InitiateCheckout", {
      content_ids: resolvedLines.map(({ product }) => product.slug),
      num_items: resolvedLines.reduce((n, { line }) => n + line.quantity, 0),
      value: subtotal,
      currency,
    });
  }, [hydrated, resolvedLines, subtotal, currency]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting || resolvedLines.length === 0) return;

    const form = e.currentTarget;
    const data = new FormData(form);
    const customer = {
      fullName: String(data.get("fullName") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      address: String(data.get("address") ?? "").trim(),
      city: String(data.get("city") ?? "").trim(),
      postalCode: String(data.get("postalCode") ?? "").trim(),
      country: String(data.get("country") ?? "").trim(),
    };
    const payment = data.get("payment") === "online" ? "online" : "cod";

    setSubmitting(true);

    const body = formatOrderWhatsAppBody({
      lines: resolvedLines.map(({ line, product }) => ({
        product,
        quantity: line.quantity,
      })),
      subtotal,
      currency,
      customer,
      payment,
    });

    clear();
    window.location.href = ascendWhatsAppUrl(body);
  };

  if (!hydrated || resolvedLines.length === 0) {
    return (
      <div className="drop-shell py-32">
        <p className="brand-body text-white/50">Loading checkout…</p>
      </div>
    );
  }

  return (
    <div className="drop-shell checkout-layout py-28 sm:py-32">
      <header className="checkout-header">
        <Link href="/drop" className="checkout-back">
          ← Back to drop
        </Link>
        <h1 className="brand-headline mt-8">Checkout</h1>
        <CartUrgency />
      </header>

      <div className="checkout-grid">
        <form className="checkout-form" onSubmit={onSubmit}>
          <fieldset className="checkout-fieldset">
            <legend className="checkout-legend">Contact</legend>
            <label className="checkout-label">
              Full name
              <input
                className="checkout-input"
                name="fullName"
                type="text"
                required
                autoComplete="name"
              />
            </label>
            <label className="checkout-label">
              Email
              <input
                className="checkout-input"
                name="email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
              />
            </label>
            <label className="checkout-label">
              Phone
              <input
                className="checkout-input"
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                inputMode="tel"
              />
            </label>
          </fieldset>

          <fieldset className="checkout-fieldset">
            <legend className="checkout-legend">Delivery</legend>
            <label className="checkout-label">
              Address
              <input
                className="checkout-input"
                name="address"
                type="text"
                required
                autoComplete="street-address"
              />
            </label>
            <div className="checkout-row">
              <label className="checkout-label">
                City
                <input
                  className="checkout-input"
                  name="city"
                  type="text"
                  required
                  autoComplete="address-level2"
                />
              </label>
              <label className="checkout-label">
                Postal code
                <input
                  className="checkout-input"
                  name="postalCode"
                  type="text"
                  required
                  autoComplete="postal-code"
                />
              </label>
            </div>
            <label className="checkout-label">
              Country
              <input
                className="checkout-input"
                name="country"
                type="text"
                required
                autoComplete="country-name"
              />
            </label>
          </fieldset>

          <fieldset className="checkout-fieldset">
            <legend className="checkout-legend">Payment</legend>
            <label className="checkout-radio">
              <input
                type="radio"
                name="payment"
                value="cod"
                defaultChecked
              />
              <span>Cash on Delivery</span>
            </label>
            <label className="checkout-radio">
              <input type="radio" name="payment" value="online" />
              <span>Pay online (link on confirmation)</span>
            </label>
          </fieldset>

          <CartTrust />
          <button
            type="submit"
            className={cn("drop-cta checkout-submit", submitting && "is-pending")}
            disabled={submitting}
          >
            {submitting ? "Opening…" : "Complete Order"}
          </button>
        </form>

        <aside className="checkout-summary" aria-label="Order summary">
          <p className="brand-eyebrow">Your order</p>
          <ul className="checkout-summary__lines">
            {resolvedLines.map(({ line, product }) => (
              <li key={line.slug} className="checkout-summary__line">
                <div className="checkout-summary__thumb">
                  <Image
                    src={product.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="72px"
                  />
                </div>
                <div className="checkout-summary__meta">
                  <p className="checkout-summary__name">{product.name}</p>
                  <p className="checkout-summary__qty">Qty {line.quantity}</p>
                </div>
                <p className="checkout-summary__price">
                  {formatMoney(product.price * line.quantity, product.currency)}
                </p>
              </li>
            ))}
          </ul>
          <div className="checkout-summary__total">
            <span>Total</span>
            <span>{formatMoney(subtotal, currency)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
