import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type {
  Product,
  ProductVariant,
  Collection,
  PublicProduct,
  PublicProductVariant,
  WearablesOverviewStats,
  ProductStatus,
  CollectionStatus,
} from "./types";
import { validateProductPublishReadiness } from "./validation";
import { DROPS } from "@/lib/data/drops";

// Local seed storage for dev/testing when Supabase is not connected
const memoryProducts = new Map<string, Product>();
const memoryVariants = new Map<string, ProductVariant>();
const memoryCollections = new Map<string, Collection>();

function seedMemoryStoreIfNeeded() {
  if (memoryProducts.size > 0) return;

  const defaultCollection: Collection = {
    id: "col-ascend-01",
    name: "Ascend Initial Drop",
    slug: "ascend-initial",
    description: "First release of core matte silhouettes.",
    story: "Discipline in every seam.",
    status: "published",
    startDate: new Date().toISOString(),
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  memoryCollections.set(defaultCollection.id, defaultCollection);

  for (const drop of DROPS) {
    const productId = `prod-${drop.slug}`;
    const product: Product = {
      id: productId,
      slug: drop.slug,
      title: drop.name,
      subtitle: drop.tagline,
      description: drop.description,
      status: "active",
      basePricePaise: Math.round(drop.price.amount * 100),
      currency: drop.price.currency,
      materials: drop.details.join(", "),
      category: drop.category,
      collectionId: defaultCollection.id,
      gender: "unisex",
      isFeatured: drop.slug === "ascend-jacket",
      publishedAt: new Date().toISOString(),
      seoTitle: `${drop.name} — Ascend Theory`,
      seoDescription: drop.description,
      primaryImageUrl: drop.image,
      galleryJson: drop.visuals.map((v) => ({ src: v.src, alt: v.alt, caption: v.caption })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryProducts.set(productId, product);

    const sizes = ["S", "M", "L", "XL"];
    sizes.forEach((size, idx) => {
      const sku = `${drop.slug.toUpperCase()}-${size}`;
      const variant: ProductVariant = {
        id: `var-${drop.slug}-${size}`,
        productId,
        sku,
        size,
        color: "black",
        colorDisplay: "Obsidian Black",
        stockQuantity: drop.scarcity.stockRemaining,
        pricePaise: Math.round(drop.price.amount * 100),
        compareAtPricePaise: 0,
        providerCostPaise: Math.round(drop.price.amount * 40),
        availabilityStatus: "available",
        isActive: true,
        weightGrams: 450,
        sortOrder: idx + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryVariants.set(variant.id, variant);
    });
  }
}

function sanitizePublicVariant(variant: ProductVariant): PublicProductVariant {
  // Exclude providerCostPaise from public outputs
  const { providerCostPaise: _, ...publicVariant } = variant;
  return publicVariant;
}

/**
 * Public Catalogue Reader: Returns published active products and their active variants ONLY.
 * Excludes draft/archived products and hides providerCostPaise.
 */
export async function getPublicProducts(): Promise<PublicProduct[]> {
  const serviceClient = createSupabaseServiceClient();

  if (serviceClient) {
    const { data: productsData, error: pError } = await serviceClient
      .from("products")
      .select("*")
      .eq("status", "active");

    if (!pError && productsData) {
      const { data: variantsData } = await serviceClient
        .from("product_variants")
        .select("*")
        .eq("is_active", true);

      const variantsMap = new Map<string, ProductVariant[]>();
      if (variantsData) {
        variantsData.forEach((v) => {
          const list = variantsMap.get(v.product_id) || [];
          list.push({
            id: v.id,
            productId: v.product_id,
            sku: v.sku,
            size: v.size,
            color: v.color,
            colorDisplay: v.color_display ?? undefined,
            stockQuantity: v.stock_quantity,
            pricePaise: Number(v.price_paise),
            compareAtPricePaise: Number(v.compare_at_price_paise || 0),
            providerCostPaise: Number(v.provider_cost_paise || 0),
            availabilityStatus: v.availability_status || "available",
            isActive: v.is_active,
            weightGrams: v.weight_grams ?? 0,
            sortOrder: v.sort_order ?? 0,
            createdAt: v.created_at,
            updatedAt: v.updated_at || v.created_at,
          });
          variantsMap.set(v.product_id, list);
        });
      }

      return productsData.map((p) => {
        const fullVariants = variantsMap.get(p.id) || [];
        return {
          id: p.id,
          slug: p.slug,
          title: p.title,
          subtitle: p.subtitle ?? undefined,
          description: p.description ?? undefined,
          status: p.status as ProductStatus,
          basePricePaise: Number(p.base_price_paise),
          currency: p.currency,
          materials: p.materials ?? undefined,
          category: p.category ?? "wearables",
          collectionId: p.collection_id ?? undefined,
          gender: p.gender ?? "unisex",
          isFeatured: Boolean(p.is_featured),
          publishedAt: p.published_at ?? undefined,
          seoTitle: p.seo_title ?? undefined,
          seoDescription: p.seo_description ?? undefined,
          primaryImageUrl: p.primary_image_url ?? undefined,
          galleryJson: (p.gallery_json as { src: string; alt?: string; caption?: string }[]) || [],
          createdAt: p.created_at,
          updatedAt: p.updated_at || p.created_at,
          variants: fullVariants.map(sanitizePublicVariant),
        };
      });
    }
  }

  // Memory fallback for local testing without Supabase
  seedMemoryStoreIfNeeded();
  const activeProducts = Array.from(memoryProducts.values()).filter((p) => p.status === "active");

  return activeProducts.map((p) => {
    const vars = Array.from(memoryVariants.values()).filter((v) => v.productId === p.id && v.isActive);
    return {
      ...p,
      variants: vars.map(sanitizePublicVariant),
    };
  });
}

/**
 * Public Catalogue Reader: Returns single published active product by slug.
 * Returns null for draft or archived products.
 */
export async function getPublicProductBySlug(slug: string): Promise<PublicProduct | null> {
  const serviceClient = createSupabaseServiceClient();

  if (serviceClient) {
    const { data: p, error } = await serviceClient
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle();

    if (!error && p) {
      const { data: variantsData } = await serviceClient
        .from("product_variants")
        .select("*")
        .eq("product_id", p.id)
        .eq("is_active", true);

      const variants: ProductVariant[] = (variantsData || []).map((v) => ({
        id: v.id,
        productId: v.product_id,
        sku: v.sku,
        size: v.size,
        color: v.color,
        colorDisplay: v.color_display ?? undefined,
        stockQuantity: v.stock_quantity,
        pricePaise: Number(v.price_paise),
        compareAtPricePaise: Number(v.compare_at_price_paise || 0),
        providerCostPaise: Number(v.provider_cost_paise || 0),
        availabilityStatus: v.availability_status || "available",
        isActive: v.is_active,
        weightGrams: v.weight_grams ?? 0,
        sortOrder: v.sort_order ?? 0,
        createdAt: v.created_at,
        updatedAt: v.updated_at || v.created_at,
      }));

      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        subtitle: p.subtitle ?? undefined,
        description: p.description ?? undefined,
        status: p.status as ProductStatus,
        basePricePaise: Number(p.base_price_paise),
        currency: p.currency,
        materials: p.materials ?? undefined,
        category: p.category ?? "wearables",
        collectionId: p.collection_id ?? undefined,
        gender: p.gender ?? "unisex",
        isFeatured: Boolean(p.is_featured),
        publishedAt: p.published_at ?? undefined,
        seoTitle: p.seo_title ?? undefined,
        seoDescription: p.seo_description ?? undefined,
        primaryImageUrl: p.primary_image_url ?? undefined,
        galleryJson: (p.gallery_json as { src: string; alt?: string; caption?: string }[]) || [],
        createdAt: p.created_at,
        updatedAt: p.updated_at || p.created_at,
        variants: variants.map(sanitizePublicVariant),
      };
    }
  }

  // Memory fallback
  seedMemoryStoreIfNeeded();
  const p = Array.from(memoryProducts.values()).find((prod) => prod.slug === slug && prod.status === "active");
  if (!p) return null;

  const vars = Array.from(memoryVariants.values()).filter((v) => v.productId === p.id && v.isActive);
  return {
    ...p,
    variants: vars.map(sanitizePublicVariant),
  };
}

/**
 * Resolves authoritative variant for checkout. Fails if product is draft or variant is inactive/unavailable.
 */
export async function getAuthoritativeVariantForCheckout(params: {
  slug?: string;
  sku?: string;
  variantId?: string;
}): Promise<{ ok: true; product: Product; variant: ProductVariant } | { ok: false; error: string }> {
  const serviceClient = createSupabaseServiceClient();

  if (serviceClient) {
    let query = serviceClient.from("product_variants").select("*, products!inner(*)");

    if (params.sku) {
      query = query.eq("sku", params.sku);
    } else if (params.variantId) {
      query = query.eq("id", params.variantId);
    } else if (params.slug) {
      query = query.eq("products.slug", params.slug);
    } else {
      return { ok: false, error: "Variant SKU or product slug required" };
    }

    const { data: vData, error: vError } = await query.maybeSingle();

    if (vError || !vData) {
      return { ok: false, error: "Unknown or invalid product variant" };
    }

    const p = vData.products;
    if (p.status !== "active") {
      return { ok: false, error: `Product '${p.title}' is not active (status: ${p.status})` };
    }

    if (!vData.is_active || vData.availability_status !== "available") {
      return { ok: false, error: `Variant SKU '${vData.sku}' is not active or available for purchase` };
    }

    const product: Product = {
      id: p.id,
      slug: p.slug,
      title: p.title,
      subtitle: p.subtitle ?? undefined,
      description: p.description ?? undefined,
      status: p.status as ProductStatus,
      basePricePaise: Number(p.base_price_paise),
      currency: p.currency,
      materials: p.materials ?? undefined,
      category: p.category ?? "wearables",
      collectionId: p.collection_id ?? undefined,
      gender: p.gender ?? "unisex",
      isFeatured: Boolean(p.is_featured),
      publishedAt: p.published_at ?? undefined,
      createdAt: p.created_at,
      updatedAt: p.updated_at || p.created_at,
      galleryJson: p.gallery_json || [],
    };

    const variant: ProductVariant = {
      id: vData.id,
      productId: vData.product_id,
      sku: vData.sku,
      size: vData.size,
      color: vData.color,
      colorDisplay: vData.color_display ?? undefined,
      stockQuantity: vData.stock_quantity,
      pricePaise: Number(vData.price_paise),
      compareAtPricePaise: Number(vData.compare_at_price_paise || 0),
      providerCostPaise: Number(vData.provider_cost_paise || 0),
      availabilityStatus: vData.availability_status || "available",
      isActive: vData.is_active,
      weightGrams: vData.weight_grams ?? 0,
      sortOrder: vData.sort_order ?? 0,
      createdAt: vData.created_at,
      updatedAt: vData.updated_at || vData.created_at,
    };

    return { ok: true, product, variant };
  }

  // Memory fallback for dev/testing
  seedMemoryStoreIfNeeded();
  let foundVariant: ProductVariant | undefined;

  if (params.sku) {
    foundVariant = Array.from(memoryVariants.values()).find((v) => v.sku.toUpperCase() === params.sku?.toUpperCase());
  } else if (params.variantId) {
    foundVariant = memoryVariants.get(params.variantId);
  } else if (params.slug) {
    const prod = Array.from(memoryProducts.values()).find((p) => p.slug === params.slug);
    if (prod) {
      foundVariant = Array.from(memoryVariants.values()).find((v) => v.productId === prod.id && v.isActive);
    }
  }

  if (!foundVariant) {
    return { ok: false, error: "Unknown or invalid product variant" };
  }

  const parentProduct = memoryProducts.get(foundVariant.productId);
  if (!parentProduct || parentProduct.status !== "active") {
    return { ok: false, error: "Product is draft or archived" };
  }

  if (!foundVariant.isActive || foundVariant.availabilityStatus !== "available") {
    return { ok: false, error: "Variant is inactive or unavailable" };
  }

  return { ok: true, product: parentProduct, variant: foundVariant };
}

/**
 * Admin Reader: Fetch all products for HQ management (including draft/archived and variants with cost).
 */
export async function getAllProductsAdmin(): Promise<Product[]> {
  const serviceClient = createSupabaseServiceClient();

  if (serviceClient) {
    const { data: productsData } = await serviceClient.from("products").select("*").order("created_at", { ascending: false });
    const { data: variantsData } = await serviceClient.from("product_variants").select("*").order("sort_order", { ascending: true });

    if (productsData) {
      const variantsMap = new Map<string, ProductVariant[]>();
      (variantsData || []).forEach((v) => {
        const list = variantsMap.get(v.product_id) || [];
        list.push({
          id: v.id,
          productId: v.product_id,
          sku: v.sku,
          size: v.size,
          color: v.color,
          colorDisplay: v.color_display ?? undefined,
          stockQuantity: v.stock_quantity,
          pricePaise: Number(v.price_paise),
          compareAtPricePaise: Number(v.compare_at_price_paise || 0),
          providerCostPaise: Number(v.provider_cost_paise || 0),
          availabilityStatus: v.availability_status || "available",
          isActive: v.is_active,
          weightGrams: v.weight_grams ?? 0,
          sortOrder: v.sort_order ?? 0,
          createdAt: v.created_at,
          updatedAt: v.updated_at || v.created_at,
        });
        variantsMap.set(v.product_id, list);
      });

      return productsData.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        subtitle: p.subtitle ?? undefined,
        description: p.description ?? undefined,
        status: p.status as ProductStatus,
        basePricePaise: Number(p.base_price_paise),
        currency: p.currency,
        materials: p.materials ?? undefined,
        category: p.category ?? "wearables",
        collectionId: p.collection_id ?? undefined,
        gender: p.gender ?? "unisex",
        isFeatured: Boolean(p.is_featured),
        publishedAt: p.published_at ?? undefined,
        seoTitle: p.seo_title ?? undefined,
        seoDescription: p.seo_description ?? undefined,
        primaryImageUrl: p.primary_image_url ?? undefined,
        galleryJson: (p.gallery_json as { src: string; alt?: string; caption?: string }[]) || [],
        createdAt: p.created_at,
        updatedAt: p.updated_at || p.created_at,
        variants: variantsMap.get(p.id) || [],
      }));
    }
  }

  seedMemoryStoreIfNeeded();
  return Array.from(memoryProducts.values()).map((p) => ({
    ...p,
    variants: Array.from(memoryVariants.values()).filter((v) => v.productId === p.id),
  }));
}

/**
 * Admin Reader: Overview statistics for Ascend HQ Wearables dashboard.
 */
export async function getWearablesOverviewStats(): Promise<WearablesOverviewStats> {
  const products = await getAllProductsAdmin();

  let publishedProductsCount = 0;
  let draftProductsCount = 0;
  let activeVariantsCount = 0;
  let productsMissingVariantsCount = 0;
  let productsMissingImageryCount = 0;
  let productsMissingProviderMappingCount = 0;

  for (const p of products) {
    if (p.status === "active") publishedProductsCount++;
    if (p.status === "draft") draftProductsCount++;

    const pVariants = p.variants || [];
    activeVariantsCount += pVariants.filter((v) => v.isActive).length;

    if (pVariants.length === 0) productsMissingVariantsCount++;
    if (!p.primaryImageUrl && (!p.galleryJson || p.galleryJson.length === 0)) productsMissingImageryCount++;

    const unmappedVariants = pVariants.filter((v) => v.providerCostPaise === 0);
    if (unmappedVariants.length > 0 || pVariants.length === 0) {
      productsMissingProviderMappingCount++;
    }
  }

  const collections = await getAllCollectionsAdmin();

  return {
    publishedProductsCount,
    draftProductsCount,
    activeVariantsCount,
    collectionsCount: collections.length,
    productsMissingVariantsCount,
    productsMissingImageryCount,
    productsMissingProviderMappingCount,
  };
}

/**
 * Admin Reader: Get all collections.
 */
export async function getAllCollectionsAdmin(): Promise<Collection[]> {
  const serviceClient = createSupabaseServiceClient();

  if (serviceClient) {
    const { data } = await serviceClient.from("collections").select("*").order("sort_order", { ascending: true });
    if (data) {
      return data.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description ?? undefined,
        story: c.story ?? undefined,
        status: (c.status as CollectionStatus) || "draft",
        startDate: c.start_date ?? undefined,
        endDate: c.end_date ?? undefined,
        heroImageUrl: c.hero_image_url ?? undefined,
        mediaJson: c.media_json || [],
        sortOrder: c.sort_order ?? 0,
        createdAt: c.created_at,
        updatedAt: c.updated_at || c.created_at,
      }));
    }
  }

  seedMemoryStoreIfNeeded();
  return Array.from(memoryCollections.values());
}

/**
 * Admin Mutation: Upsert a Product with variants. Validates slug, SKU uniqueness, and publish-readiness.
 */
export async function saveProductAdmin(
  input: Omit<Partial<Product>, "variants"> & { variants?: Partial<ProductVariant>[] },
  adminId: string
): Promise<{ ok: true; product: Product } | { ok: false; error: string; errors?: string[] }> {
  const serviceClient = createSupabaseServiceClient();

  const title = input.title?.trim();
  const slug = input.slug?.trim().toLowerCase();

  if (!title || !slug) {
    return { ok: false, error: "Title and slug are required" };
  }

  // Validate slug uniqueness against other products
  if (serviceClient) {
    let slugCheck = serviceClient.from("products").select("id").eq("slug", slug);
    if (input.id) {
      slugCheck = slugCheck.neq("id", input.id);
    }
    const { data: existingSlug } = await slugCheck.maybeSingle();
    if (existingSlug) {
      return { ok: false, error: `Product slug '${slug}' already exists` };
    }
  } else {
    seedMemoryStoreIfNeeded();
    for (const [pId, p] of memoryProducts.entries()) {
      if (p.slug === slug && pId !== input.id) {
        return { ok: false, error: `Product slug '${slug}' already exists` };
      }
    }
  }

  // Check SKU uniqueness
  const inputVariants = input.variants || [];
  const skuSet = new Set<string>();
  for (const v of inputVariants) {
    if (v.sku) {
      const norm = v.sku.trim().toUpperCase();
      if (skuSet.has(norm)) {
        return { ok: false, error: `Duplicate variant SKU '${v.sku}' in payload` };
      }
      skuSet.add(norm);

      if (serviceClient) {
        let skuQuery = serviceClient.from("product_variants").select("id, product_id").eq("sku", norm);
        if (v.id) {
          skuQuery = skuQuery.neq("id", v.id);
        }
        const { data: existingSku } = await skuQuery.maybeSingle();
        if (existingSku && existingSku.product_id !== input.id) {
          return { ok: false, error: `Variant SKU '${v.sku}' is already assigned to another product` };
        }
      } else {
        for (const [vId, varItem] of memoryVariants.entries()) {
          if (varItem.sku.toUpperCase() === norm && varItem.id !== v.id && varItem.productId !== input.id) {
            return { ok: false, error: `Variant SKU '${v.sku}' is already assigned to another product` };
          }
        }
      }
    }
  }

  const productId = input.id || (serviceClient ? crypto.randomUUID() : `prod-${slug}`);

  const productRecord: Product = {
    id: productId,
    slug,
    title,
    subtitle: input.subtitle,
    description: input.description,
    status: input.status || "draft",
    basePricePaise: input.basePricePaise ?? 0,
    currency: input.currency || "INR",
    materials: input.materials,
    category: input.category || "wearables",
    collectionId: input.collectionId,
    gender: input.gender || "unisex",
    isFeatured: Boolean(input.isFeatured),
    publishedAt: input.status === "active" ? input.publishedAt || new Date().toISOString() : null,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    primaryImageUrl: input.primaryImageUrl,
    galleryJson: input.galleryJson || [],
    sizeChartJson: input.sizeChartJson,
    createdAt: input.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // If status is active, enforce publish-readiness validator
  if (input.status === "active") {
    const fullVariants: ProductVariant[] = inputVariants.map((v, idx) => ({
      id: v.id || `var-temp-${idx}`,
      productId,
      sku: v.sku || "",
      size: v.size || "S",
      color: v.color || "black",
      colorDisplay: v.colorDisplay,
      stockQuantity: v.stockQuantity ?? 0,
      pricePaise: v.pricePaise ?? 0,
      compareAtPricePaise: v.compareAtPricePaise ?? 0,
      providerCostPaise: v.providerCostPaise ?? 0,
      availabilityStatus: v.availabilityStatus || "available",
      isActive: v.isActive ?? true,
      sortOrder: v.sortOrder ?? idx,
      createdAt: v.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const validation = validateProductPublishReadiness(productRecord, fullVariants);
    if (!validation.isValid) {
      return { ok: false, error: "Product publish readiness check failed", errors: validation.errors };
    }
  }

  if (serviceClient) {
    const { error: pErr } = await serviceClient.from("products").upsert({
      id: productRecord.id,
      slug: productRecord.slug,
      title: productRecord.title,
      subtitle: productRecord.subtitle ?? null,
      description: productRecord.description ?? null,
      status: productRecord.status,
      base_price_paise: productRecord.basePricePaise,
      currency: productRecord.currency,
      materials: productRecord.materials ?? null,
      category: productRecord.category,
      collection_id: productRecord.collectionId ?? null,
      gender: productRecord.gender,
      is_featured: productRecord.isFeatured,
      published_at: productRecord.publishedAt ?? null,
      seo_title: productRecord.seoTitle ?? null,
      seo_description: productRecord.seoDescription ?? null,
      primary_image_url: productRecord.primaryImageUrl ?? null,
      gallery_json: productRecord.galleryJson,
      size_chart_json: productRecord.sizeChartJson ?? null,
      updated_at: new Date().toISOString(),
    });

    if (pErr) {
      return { ok: false, error: `Failed to save product in database: ${pErr.message}` };
    }

    // Save variants
    const upsertedVariants: ProductVariant[] = [];
    for (const [idx, v] of inputVariants.entries()) {
      const varId = v.id || crypto.randomUUID();
      const variantRecord: ProductVariant = {
        id: varId,
        productId,
        sku: v.sku ? v.sku.trim().toUpperCase() : `${slug.toUpperCase()}-${v.size || "S"}`,
        size: v.size || "S",
        color: v.color || "black",
        colorDisplay: v.colorDisplay,
        stockQuantity: v.stockQuantity ?? 0,
        pricePaise: v.pricePaise ?? 0,
        compareAtPricePaise: v.compareAtPricePaise ?? 0,
        providerCostPaise: v.providerCostPaise ?? 0,
        availabilityStatus: v.availabilityStatus || "available",
        isActive: v.isActive ?? true,
        weightGrams: v.weightGrams ?? 0,
        sortOrder: v.sortOrder ?? idx,
        createdAt: v.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { error: vErr } = await serviceClient.from("product_variants").upsert({
        id: variantRecord.id,
        product_id: variantRecord.productId,
        sku: variantRecord.sku,
        size: variantRecord.size,
        color: variantRecord.color,
        color_display: variantRecord.colorDisplay ?? null,
        stock_quantity: variantRecord.stockQuantity,
        price_paise: variantRecord.pricePaise,
        compare_at_price_paise: variantRecord.compareAtPricePaise,
        provider_cost_paise: variantRecord.providerCostPaise,
        availability_status: variantRecord.availabilityStatus,
        is_active: variantRecord.isActive,
        weight_grams: variantRecord.weightGrams,
        sort_order: variantRecord.sortOrder,
        updated_at: new Date().toISOString(),
      });

      if (!vErr) {
        upsertedVariants.push(variantRecord);
      }
    }

    // Write Audit Log
    await serviceClient.from("audit_logs").insert({
      admin_id: adminId,
      action: input.id ? "product_updated" : "product_created",
      entity_type: "product",
      entity_id: productId,
      details_json: { title: productRecord.title, slug: productRecord.slug, status: productRecord.status },
    });

    productRecord.variants = upsertedVariants;
    return { ok: true, product: productRecord };
  }

  // Memory fallback
  seedMemoryStoreIfNeeded();
  memoryProducts.set(productId, productRecord);

  const savedVariants: ProductVariant[] = [];
  inputVariants.forEach((v, idx) => {
    const varId = v.id || `var-${slug}-${v.size || "S"}`;
    const variantRecord: ProductVariant = {
      id: varId,
      productId,
      sku: v.sku ? v.sku.trim().toUpperCase() : `${slug.toUpperCase()}-${v.size || "S"}`,
      size: v.size || "S",
      color: v.color || "black",
      colorDisplay: v.colorDisplay,
      stockQuantity: v.stockQuantity ?? 0,
      pricePaise: v.pricePaise ?? 0,
      compareAtPricePaise: v.compareAtPricePaise ?? 0,
      providerCostPaise: v.providerCostPaise ?? 0,
      availabilityStatus: v.availabilityStatus || "available",
      isActive: v.isActive ?? true,
      weightGrams: v.weightGrams ?? 0,
      sortOrder: v.sortOrder ?? idx,
      createdAt: v.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryVariants.set(varId, variantRecord);
    savedVariants.push(variantRecord);
  });

  productRecord.variants = savedVariants;
  return { ok: true, product: productRecord };
}

/**
 * Admin Mutation: Upsert Collection.
 */
export async function saveCollectionAdmin(
  input: Partial<Collection>,
  adminId: string
): Promise<{ ok: true; collection: Collection } | { ok: false; error: string }> {
  const serviceClient = createSupabaseServiceClient();

  const name = input.name?.trim();
  const slug = input.slug?.trim().toLowerCase();

  if (!name || !slug) {
    return { ok: false, error: "Collection name and slug are required" };
  }

  const colId = input.id || (serviceClient ? crypto.randomUUID() : `col-${slug}`);
  const collection: Collection = {
    id: colId,
    name,
    slug,
    description: input.description,
    story: input.story,
    status: input.status || "draft",
    startDate: input.startDate,
    endDate: input.endDate,
    heroImageUrl: input.heroImageUrl,
    mediaJson: input.mediaJson || [],
    sortOrder: input.sortOrder ?? 0,
    createdAt: input.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (serviceClient) {
    const { error } = await serviceClient.from("collections").upsert({
      id: collection.id,
      name: collection.name,
      slug: collection.slug,
      description: collection.description ?? null,
      story: collection.story ?? null,
      status: collection.status,
      start_date: collection.startDate ?? null,
      end_date: collection.endDate ?? null,
      hero_image_url: collection.heroImageUrl ?? null,
      media_json: collection.mediaJson,
      sort_order: collection.sortOrder,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return { ok: false, error: `Failed to save collection: ${error.message}` };
    }

    await serviceClient.from("audit_logs").insert({
      admin_id: adminId,
      action: input.id ? "collection_updated" : "collection_created",
      entity_type: "collection",
      entity_id: colId,
      details_json: { name: collection.name, slug: collection.slug, status: collection.status },
    });

    return { ok: true, collection };
  }

  seedMemoryStoreIfNeeded();
  memoryCollections.set(colId, collection);
  return { ok: true, collection };
}
