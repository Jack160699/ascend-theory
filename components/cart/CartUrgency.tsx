export function CartUrgency({ compact = false }: { compact?: boolean }) {
  return (
    <p
      className={
        compact
          ? "cart-urgency cart-urgency--compact"
          : "cart-urgency"
      }
    >
      <span>Limited Drop</span>
      <span className="cart-urgency__dot" aria-hidden>
        ·
      </span>
      <span>No Restock</span>
    </p>
  );
}
