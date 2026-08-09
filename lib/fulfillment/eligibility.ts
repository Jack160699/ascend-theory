/**
 * Phase 6 — Server-Side Fulfilment Eligibility Evaluator
 * Evaluates whether an Ascend customer order is eligible for POD manufacturing fulfillment.
 */

import { getOrderAdmin } from "@/lib/orders/store";
import { getProductReadinessReportsAdmin, getAllProviderMappingsAdmin, getAllPODProvidersAdmin, getAllMockupsAdmin, getAllDesignsAdmin } from "@/lib/wearables/design-store";
import { getProductAdmin } from "@/lib/wearables/store";
import { evaluateVariantReadiness } from "@/lib/wearables/readiness-engine";
import type { FulfillmentEligibilityResult } from "./types";
import { getFulfillmentByOrderIdAdmin } from "./fulfillment-store";

export async function evaluateOrderFulfillmentEligibility(
  orderId: string,
  currentFulfillmentId?: string,
): Promise<FulfillmentEligibilityResult> {
  const blockingReasons: string[] = [];

  const order = await getOrderAdmin(orderId);
  if (!order) {
    return { eligible: false, blockingReasons: ["order_not_found"] };
  }

  // 1. COD Gate Check (Req #8: Phase 7 owns COD risk approval)
  if (order.paymentMethod === "cod" || order.isCod) {
    blockingReasons.push("cod_requires_phase7_approval");
  }

  // 2. Authoritative Payment Check (Req #7: PREPAID require captured/paid status)
  const isPaid = order.paymentStatus === "paid" || order.status === "paid" || order.status === "processing";
  if (!isPaid) {
    blockingReasons.push("unpaid_prepaid_order");
  }

  // 3. Shipping Address Completeness Check
  const addr = order.shippingAddress || order.customer;
  const line1 = addr?.addressLine1 || addr?.address;
  if (!addr || !addr.fullName?.trim() || !line1?.trim() || !addr.city?.trim() || !addr.postalCode?.trim()) {
    blockingReasons.push("incomplete_shipping_address");
  }

  // 4. Duplicate Active Fulfillment Conflict Check
  const existingFulfillment = await getFulfillmentByOrderIdAdmin(orderId);
  if (
    existingFulfillment &&
    existingFulfillment.id !== currentFulfillmentId &&
    !["FAILED", "CANCELLED", "failed", "cancelled"].includes(existingFulfillment.status)
  ) {
    blockingReasons.push("existing_active_fulfillment_conflict");
  }

  // 5. Order Item Product / Variant / Phase 5 Readiness Checks
  const items = order.items || [];
  if (items.length === 0) {
    blockingReasons.push("empty_order_items");
  }

  let selectedProvider = undefined;
  let selectedProviderProduct = undefined;
  let selectedProviderVariant = undefined;

  for (const item of items) {
    if (!item.productId || !item.variantId) {
      blockingReasons.push("missing_item_variant_identity");
      continue;
    }

    const product = await getProductAdmin(item.productId);
    if (!product || product.status !== "active") {
      blockingReasons.push("draft_product");
      continue;
    }

    const variant = (product.variants || []).find((v) => v.id === item.variantId);
    if (!variant || !variant.isActive) {
      blockingReasons.push("inactive_variant");
      continue;
    }
    if (variant.availabilityStatus !== "available") {
      blockingReasons.push("unavailable_variant");
    }

    const mappings = await getAllProviderMappingsAdmin();
    const providers = await getAllPODProvidersAdmin();
    const designs = await getAllDesignsAdmin();
    const mockups = await getAllMockupsAdmin();

    const designsMap = new Map(designs.map((d) => [d.id, d]));
    const placementsList = designs.flatMap((d) => d.placements || []);

    const pProd = mappings.providerProducts.find(
      (pp) => pp.productId === product.id && pp.mappingStatus === "verified",
    );

    if (!pProd) {
      blockingReasons.push("unverified_provider_product_mapping");
      continue;
    }

    const pVar = mappings.providerVariants.find(
      (pv) => pv.productVariantId === variant.id && pv.providerProductId === pProd.id && pv.mappingStatus === "verified",
    );

    if (!pVar) {
      blockingReasons.push("unverified_provider_variant_mapping");
      continue;
    }

    const prov = providers.find((p) => p.id === pProd.providerId);
    if (!prov || !prov.isActive) {
      blockingReasons.push("disabled_provider_mapping");
      continue;
    }

    selectedProvider = prov;
    selectedProviderProduct = pProd;
    selectedProviderVariant = pVar;

    const vPlacements = placementsList.filter((p) => p.productVariantId === variant.id && p.isActive);

    const readiness = evaluateVariantReadiness({
      product,
      variant,
      placements: vPlacements,
      designsMap,
      providers: [prov],
      providerProduct: pProd,
      providerVariant: pVar,
      providerMappings: [{ provider: prov, productVariantId: variant.id, providerProduct: pProd, providerVariant: pVar }],
      mockups: mockups.filter((m) => m.productId === product.id),
    });

    if (!readiness.readyForFulfillment) {
      blockingReasons.push(...readiness.blockingReasons);
    }
  }

  const uniqueReasons = Array.from(new Set(blockingReasons));
  const eligible = uniqueReasons.length === 0;

  return {
    eligible,
    blockingReasons: uniqueReasons,
    order,
    provider: selectedProvider,
    providerProduct: selectedProviderProduct,
    providerVariant: selectedProviderVariant,
  };
}
