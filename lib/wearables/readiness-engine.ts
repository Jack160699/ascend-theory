/**
 * Phase 5 — Server-Side Fulfilment Readiness Engine
 * Evaluates whether an Ascend product / variant is ready for POD manufacturing fulfillment.
 */

import type { Product, ProductVariant } from "./types";
import type {
  DesignAsset,
  DesignPlacement,
  PODProvider,
  ProviderProduct,
  ProviderVariant,
  ProductMockup,
  VariantReadiness,
  ProviderReadiness,
  ProductReadinessReport,
  ReadinessBlockingReason,
  PrintableAreaSpec,
} from "./design-types";
import { validateDesignPlacement } from "./placement-validator";

export function evaluateVariantReadiness(input: {
  product: Product;
  variant: ProductVariant;
  design?: DesignAsset | null;
  placement?: DesignPlacement | null;
  providers?: PODProvider[];
  providerProduct?: ProviderProduct | null;
  providerVariant?: ProviderVariant | null;
  providerMappings?: Array<{
    provider: PODProvider;
    providerProduct?: ProviderProduct | null;
    providerVariant?: ProviderVariant | null;
  }>;
  mockups?: ProductMockup[];
}): VariantReadiness {
  const {
    product,
    variant,
    design,
    placement,
    providers = [],
    providerProduct,
    providerVariant,
    providerMappings,
    mockups = [],
  } = input;

  const baseReasons: ReadinessBlockingReason[] = [];

  // 1. Product published check
  const productPublished = product.status === "active";
  if (!productPublished) {
    baseReasons.push("draft_product");
  }

  // 2. Variant active check
  const variantActive = Boolean(variant.isActive);
  if (!variantActive) {
    baseReasons.push("inactive_variant");
  }

  // 3. Variant available check
  const variantAvailable = variant.availabilityStatus === "available";
  if (!variantAvailable) {
    baseReasons.push("unavailable_variant");
  }

  // 4. Design active check
  let designAssigned = false;
  if (!design) {
    baseReasons.push("missing_design");
  } else if (design.status === "draft") {
    baseReasons.push("draft_design");
  } else if (design.status === "archived") {
    baseReasons.push("archived_design");
  } else {
    designAssigned = true;
  }

  // 5. Artwork asset check
  const artworkPresent = Boolean(
    design &&
      ((design.storagePath && design.storagePath.trim().length > 0) ||
        (design.assetUrl && design.assetUrl.trim().length > 0)),
  );
  if (!artworkPresent && design) {
    baseReasons.push("missing_artwork");
  }

  // 6. Placement valid check
  let placementValid = false;
  if (placement) {
    const valRes = validateDesignPlacement(placement);
    placementValid = valRes.isValid && Boolean(placement.isActive);
    if (!placementValid) {
      baseReasons.push("invalid_placement_dimensions");
    }
  } else {
    baseReasons.push("missing_design");
  }

  // 7. Applicable Approved Primary Mockup check
  const mockupReady = mockups.some(
    (m) =>
      m.status === "approved" &&
      m.isPrimary === true &&
      m.productId === product.id &&
      (!m.variantId || m.variantId === variant.id),
  );
  if (!mockupReady) {
    baseReasons.push("no_approved_primary_mockup");
  }

  // 8. Multi-Provider Path Evaluation
  const providerPathList: Array<{
    provider: PODProvider;
    providerProduct?: ProviderProduct | null;
    providerVariant?: ProviderVariant | null;
  }> = [];

  if (providerMappings && providerMappings.length > 0) {
    providerPathList.push(...providerMappings);
  } else if (providerProduct || providerVariant) {
    const pSlug = providerProduct?.providerId === "a0000000-0000-0000-0000-000000000001" ? "qikink" : "printrove";
    const pName = pSlug === "qikink" ? "Qikink" : "Printrove";
    providerPathList.push({
      provider: {
        id: providerProduct?.providerId || "a0000000-0000-0000-0000-000000000001",
        slug: pSlug,
        name: pName,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      providerProduct,
      providerVariant,
    });
  } else if (providers.length > 0) {
    providers.forEach((p) => {
      providerPathList.push({ provider: p });
    });
  }

  const providerReadinessList: ProviderReadiness[] = [];
  let atLeastOneProviderReady = false;

  if (providerPathList.length === 0) {
    baseReasons.push("missing_provider");
  } else {
    for (const pPath of providerPathList) {
      const pReasons: ReadinessBlockingReason[] = [...baseReasons];
      const pProd = pPath.providerProduct;
      const pVar = pPath.providerVariant;

      if (!pPath.provider || !pPath.provider.isActive) {
        pReasons.push("disabled_provider_mapping");
      }

      if (!pProd || !pProd.externalProductId) {
        pReasons.push("missing_provider_product_mapping");
      } else if (pProd.mappingStatus === "disabled") {
        pReasons.push("disabled_provider_mapping");
      } else if (pProd.mappingStatus !== "verified") {
        pReasons.push("unverified_provider_product_mapping");
      }

      if (!pVar || !pVar.externalVariantId) {
        pReasons.push("missing_provider_variant_mapping");
      } else if (pVar.mappingStatus === "disabled") {
        pReasons.push("disabled_provider_mapping");
      } else if (pVar.mappingStatus !== "verified") {
        pReasons.push("unverified_provider_variant_mapping");
      }

      // Printable area dimension check for this provider
      if (placement && pProd?.printableAreasJson && pProd.printableAreasJson.length > 0) {
        const areaSpec = pProd.printableAreasJson.find((spec: PrintableAreaSpec) => {
          const specLoc = (spec.location || (spec as unknown as { placementLocation?: string }).placementLocation);
          return specLoc === placement.placementLocation && spec.printMethod === placement.printMethod;
        });

        if (areaSpec) {
          if (placement.widthMm > areaSpec.maxWidthMm || placement.heightMm > areaSpec.maxHeightMm) {
            pReasons.push("print_exceeds_provider_area");
          }
        }
      }

      const pathReady = pReasons.length === 0;
      if (pathReady) {
        atLeastOneProviderReady = true;
      }

      providerReadinessList.push({
        providerId: pPath.provider.id,
        providerSlug: pPath.provider.slug,
        providerName: pPath.provider.name,
        ready: pathReady,
        reasons: pReasons,
      });
    }
  }

  const providerSelected = providerPathList.some((p) => p.providerProduct !== undefined);
  const providerProductMapped = providerPathList.some((p) => Boolean(p.providerProduct?.externalProductId));
  const providerVariantMapped = providerPathList.some((p) => Boolean(p.providerVariant?.externalVariantId));

  const allCombinedReasons = Array.from(
    new Set([
      ...baseReasons,
      ...providerReadinessList.flatMap((pr) => pr.reasons),
    ]),
  );

  return {
    variantId: variant.id,
    sku: variant.sku,
    size: variant.size,
    color: variant.color,
    readyForFulfillment: atLeastOneProviderReady && baseReasons.length === 0,
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
    providerReadiness: providerReadinessList,
    blockingReasons: atLeastOneProviderReady && baseReasons.length === 0 ? [] : allCombinedReasons,
  };
}

export function evaluateProductReadiness(input: {
  product: Product;
  providers?: PODProvider[];
  designsMap?: Map<string, DesignAsset>;
  placementsMap?: Map<string, DesignPlacement>;
  providerProductsMap?: Map<string, ProviderProduct>;
  providerVariantsMap?: Map<string, ProviderVariant>;
  providerMappingsList?: Array<{
    provider: PODProvider;
    providerProduct?: ProviderProduct | null;
    providerVariant?: ProviderVariant | null;
  }>;
  mockups?: ProductMockup[];
}): ProductReadinessReport {
  const {
    product,
    providers = [],
    designsMap = new Map(),
    placementsMap = new Map(),
    providerProductsMap = new Map(),
    providerVariantsMap = new Map(),
    providerMappingsList,
    mockups = [],
  } = input;

  const variants = product.variants || [];
  const variantReports: VariantReadiness[] = variants.map((v) => {
    const placement = placementsMap.get(v.id) || placementsMap.get(product.id);
    const design = placement ? designsMap.get(placement.designId) : undefined;
    const providerProduct = providerProductsMap.get(product.id);
    const providerVariant = providerVariantsMap.get(v.id);
    const productMockups = mockups.filter((m) => m.productId === product.id);

    return evaluateVariantReadiness({
      product,
      variant: v,
      design,
      placement,
      providers,
      providerProduct,
      providerVariant,
      providerMappings: providerMappingsList,
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
