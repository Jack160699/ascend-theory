/** Human-readable order id: AT-20260517-A3F2 */
export function createOrderId(): string {
  const date = new Date();
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AT-${y}${m}${d}-${rand}`;
}
