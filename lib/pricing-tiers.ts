import type { TierKey } from "@/lib/lead-context";

export type PricingTier = {
  key: TierKey;
  name: string;
  label: string;
  purpose: string;
  price: string;
  priceNote?: string;
  features: string[];
  badge?: string;
  featured?: boolean;
};

export const PRICING_TIERS: PricingTier[] = [
  {
    key: "core",
    name: "Ascend Core",
    label: "Foundation",
    purpose: "Shared lane. Firm structure.",
    price: "₹7,000 + GST / month",
    features: [
      "Standard accountability rhythm",
      "Cohort mentor access",
      "Replies within business hours",
      "Structured private depth",
      "Manual review before entry",
    ],
  },
  {
    key: "pro",
    name: "Ascend Pro",
    label: "Accelerated",
    purpose: "Closer access when decisions cannot wait.",
    price: "₹15,000 + GST / month",
    features: [
      "Higher accountability rhythm",
      "Priority mentor access",
      "Faster reply windows",
      "Deeper private support",
      "Tighter weekly structure",
    ],
    badge: "Primary allocation",
    featured: true,
  },
  {
    key: "black",
    name: "Ascend Black",
    label: "Private",
    purpose: "Discretion-first. Invitation after review.",
    price: "₹55,000 + GST / month",
    priceNote:
      "Private · discretion-first · manually reviewed · invitation only",
    features: [
      "Maximum accountability",
      "Closest private mentor access",
      "Fastest replies where possible",
      "Fully bespoke private support",
      "Discretion-first communication",
    ],
    badge: "Invitation only",
  },
];
