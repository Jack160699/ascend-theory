"use client";

import { formatMoney, lineTotal } from "@/lib/cart/format";
import type { CartLine, CartProduct } from "@/lib/cart/types";
import Image from "next/image";

type CartLineItemProps = {
  line: CartLine;
  product: CartProduct;
  onQuantityChange: (quantity: number) => void;
};

export function CartLineItem({
  line,
  product,
  onQuantityChange,
}: CartLineItemProps) {
  const total = lineTotal(product, line.quantity);

  return (
    <li className="cart-line">
      <div className="cart-line__media">
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          className="object-cover object-center"
          sizes="96px"
        />
      </div>

      <div className="cart-line__body">
        <p className="cart-line__drop">{product.dropName}</p>
        <p className="cart-line__name">{product.name}</p>
        <p className="cart-line__unit">{product.priceDisplay}</p>

        <div className="cart-line__qty">
          <button
            type="button"
            className="cart-qty-btn"
            aria-label="Decrease quantity"
            onClick={() => onQuantityChange(line.quantity - 1)}
          >
            −
          </button>
          <span className="cart-qty-value" aria-live="polite">
            {line.quantity}
          </span>
          <button
            type="button"
            className="cart-qty-btn"
            aria-label="Increase quantity"
            disabled={line.quantity >= product.maxQuantity}
            onClick={() => onQuantityChange(line.quantity + 1)}
          >
            +
          </button>
        </div>
      </div>

      <p className="cart-line__total">
        {formatMoney(total, product.currency)}
      </p>
    </li>
  );
}
