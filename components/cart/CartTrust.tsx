const TRUST_ITEMS = [
  "Secure Checkout",
  "Cash on Delivery Available",
  "Easy Returns",
] as const;

export function CartTrust() {
  return (
    <ul className="cart-trust" aria-label="Purchase assurances">
      {TRUST_ITEMS.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
