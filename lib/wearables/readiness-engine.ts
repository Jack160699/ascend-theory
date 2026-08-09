/**
 * Phase 5 — Server-Side Fulfilment Readiness Engine
 * Evaluates whether an Ascend product / variant is ready for POD manufacturing fulfillment.
 */

import type { Product, ProductVariant } from "./types";
import type {
  DesignAsset,
  DesignPlacement,
  ProviderProduct,
  ProviderVariant,
  ProductMockup,
  VariantReadiness,
  ProductReadinessReport,
  ReadinessBlockingReason,
} from "./design-types";
import { validateDesignPlacement } from "./placement-validator";

export function evaluateVariantReadiness(input: {
  product: Product;
  variant: ProductVariant;
  design?: DesignAsset | null;
  placement?: DesignPlacement | null;
  providerProduct?: ProviderProduct | null;
  providerVariant?: ProviderVariant | null;
  mockups?: ProductMockup[];
}): VariantReadiness {
  const { product, variant, design, placement, providerProduct, providerVariant, mockups = [] } = input;
  const blockingReasons: ReadinessBlockingReason[] = [];

  // 1. Product published check
  const productPublished = product.status === "active";
  if (!productPublished) {
    blockingReasons.push("draft_product");
  }

  // 2. Variant active check
  const variantActive = Boolean(variant.isActive);
  if (!variantActive) {
    blockingReasons.push("inactive_variant");
  }

  // 3. Variant available check
  const variantAvailable = variant.availabilityStatus === "available";
  if (!variantAvailable) {
    blockingReasons.push("unavailable_variant");
  }

  // 4. Design assigned check
  const designAssigned = Boolean(design && (design.status === "active" || design.status === "draft"));
  if (!designAssigned) {
    blockingReasons.push("missing_design");
  }

  // 5. Artwork asset check
  const artworkPresent = Boolean(design && design.assetUrl && design.assetUrl.trim().length > 0);
  if (!artworkPresent && designAssigned) {
    blockingReasons.push("missing_artwork");
  }

  // 6. Placement valid check
  let placementValid = false;
  if (placement) {
    const valRes = validateDesignPlacement(placement);
    placementValid = valRes.isValid && Boolean(placement.isActive);
    if (!placementValid) {
      blockingReasons.push("invalid_placement_dimensions");
    }
  } else {
    blockingReasons.push("missing_design");
  }

  // 7. Provider selected & product mapped check
  const providerSelected = Boolean(providerProduct && providerProduct.providerId);
  if (!providerSelected) {
    blockingReasons.push("missing_provider");
  }

  const providerProductMapped = Boolean(
    providerProduct &&
      providerProduct.externalProductId &&
      (providerProduct.mappingStatus === "mapped" || providerProduct.mappingStatus === "verified")
  );
  if (!providerProductMapped && providerSelected) {
    blockingReasons.push("missing_provider_product_mapping");
  }

  // 8. Exact provider variant mapped check
  const providerVariantMapped = Boolean(
    providerVariant &&
      providerVariant.externalVariantId &&
      (providerVariant.mappingStatus === "mapped" || providerVariant.mappingStatus === "verified")
  );
  if (!providerVariantMapped) {
    blockingReasons.push("missing_provider_variant_mapping");
  } else if (providerVariant?.mappingStatus === "disabled") {
    blockingReasons.push("disabled_provider_mapping");
  }

  // Check unverified mapping requirement
  if (providerVariant && providerVariant.mappingStatus === "draft") {
    blockingReasons.push("unverified_provider_mapping");
  }

  // 9. Approved mockup check
  const mockupReady = mockups.some((m) => m.status === "approved");
  if (!mockupReady) {
    blockingReasons.push("no_approved_mockup");
  }

  const readyForFulfillment = blockingReasons.length === 0;

  return {
    variantId: variant.id,
    sku: variant.sku,
    size: variant.size,
    color: variant.color,
    readyForFulfillment,
    checks: {
      productPublished,
      variantActive,
      variantAvailable,
      designAssigned,
      placementValid,
      artworkPresent,
      providerSelected,
      providerProductMapped,
      providerVariantMapped,
      mockupReady,
    },
    blockingReasons,
  };
}

export function evaluateProductReadiness(input: {
  product: Product;
  designsMap?: Map<string, DesignAsset>;
  placementsMap?: Map<string, DesignPlacement>;
  providerProductsMap?: Map<string, ProviderProduct>;
  providerVariantsMap?: Map<string, ProviderVariant>;
  mockups?: ProductMockup[];
}): ProductReadinessReport {
  const {
    product,
    designsMap = new Map(),
    placementsMap = new Map(),
    providerProductsMap = new Map(),
    providerVariantsMap = new Map(),
    mockups = [],
  } = input;

  const variants = product.variants || [];
  const variantReports: VariantReadiness[] = variants.map((v) => {
    const placement = placementsMap.get(v.id) || placementsMap.get(product.id);
    const design = placement ? designsMap.get(placement.designId) : undefined;
    const providerProduct = providerProductsMap.get(product.id);
    const providerVariant = providerVariantsMap.get(v.id);
    const productMockups = mockups.filter((m) => m.productId === product.id && (!m.variantId || m.variantId === v.id));

    return evaluateVariantReadiness({
      product,
      variant: v,
      design,
      placement,
      providerProduct,
      providerVariant,
      mockups: productMockups,
    });
  });

  const readyCount = variantReports.filter((r) => r.readyForFulfillment).length;
  const overallReady = variants.length > 0 && readyCount === variants.length;

  return {
    productId: product.id,
    slug: product.slug,
    title: product.title,
    productPublished: product.status === "active",
    overallReady,
    readyVariantCount: readyCount,
    totalVariantCount: variants.length,
    variants: variantReports,
  };
}
