export type CartLine = {
  slug: string;
  quantity: number;
};

export type CartProduct = {
  slug: string;
  name: string;
  dropName: string;
  image: string;
  imageAlt: string;
  price: number;
  currency: string;
  priceDisplay: string;
  maxQuantity: number;
};

export type CheckoutDetails = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  payment: "cod" | "online";
};
