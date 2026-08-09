"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import type { Product } from "@/lib/wearables/types";
import type {
  PODProvider,
  ProviderProduct,
  ProviderVariant,
  MappingStatus,
} from "@/lib/wearables/design-types";

type PODMappingViewProps = {
  products: Product[];
};

export function PODMappingView({ products }: PODMappingViewProps) {
  const [providers, setProviders] = useState<PODProvider[]>([]);
  const [providerProducts, setProviderProducts] = useState<ProviderProduct[]>([]);
  const [providerVariants, setProviderVariants] = useState<ProviderVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || "");

  // Form inputs
  const [existingProviderProductId, setExistingProviderProductId] = useState<string | undefined>(undefined);
  const [extProductId, setExtProductId] = useState("");
  const [providerProdTitle, setProviderProdTitle] = useState("");
  const [mappingStatus, setMappingStatus] = useState<MappingStatus>("mapped");
  const [notes, setNotes] = useState("");

  // Variant mappings dictionary: productVariantId -> { id?, externalVariantId, externalSku }
  const [variantMappings, setVariantMappings] = useState<
    Record<string, { id?: string; externalVariantId: string; externalSku: string }>
  >({});

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const fetchMappingData = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/wearables/pod-mappings");
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers || []);
        setProviderProducts(data.providerProducts || []);
        setProviderVariants(data.providerVariants || []);
      } else {
        setError("Failed to fetch POD provider mappings");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/admin/wearables/pod-mappings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        if (data) {
          setProviders(data.providers || []);
          setProviderProducts(data.providerProducts || []);
          setProviderVariants(data.providerVariants || []);
          if (data.providers && data.providers.length > 0) {
            setSelectedProviderId(data.providers[0].id);
          }
        }
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) || products[0],
    [products, selectedProductId],
  );

  const syncFormState = useCallback(
    (prodId: string, provId: string) => {
      const existingPP = providerProducts.find(
        (pp) => pp.productId === prodId && pp.providerId === provId,
      );

      if (existingPP) {
        setExistingProviderProductId(existingPP.id);
        setExtProductId(existingPP.externalProductId || "");
        setProviderProdTitle(existingPP.title || existingPP.name || "");
        setMappingStatus(existingPP.mappingStatus || "mapped");
        setNotes(existingPP.notes || "");

        const mappedVars = providerVariants.filter((pv) => pv.providerProductId === existingPP.id);
        const mapDict: Record<string, { id?: string; externalVariantId: string; externalSku: string }> = {};
        mappedVars.forEach((v) => {
          if (v.productVariantId) {
            mapDict[v.productVariantId] = {
              id: v.id,
              externalVariantId: v.externalVariantId,
              externalSku: v.externalSku || v.sku || "",
            };
          }
        });
        setVariantMappings(mapDict);
      } else {
        setExistingProviderProductId(undefined);
        setExtProductId("");
        setProviderProdTitle("");
        setMappingStatus("unmapped");
        setNotes("");
        setVariantMappings({});
      }
    },
    [providerProducts, providerVariants],
  );

  const handleProviderSelect = (provId: string) => {
    setSelectedProviderId(provId);
    syncFormState(selectedProductId, provId);
  };

  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    syncFormState(prodId, selectedProviderId);
  };

  const handleSaveMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProviderId || !selectedProductId || !extProductId.trim()) return;

    setSaveLoading(true);
    setSaveError(null);
    setSaveSuccess(null);

    const variantsPayload = Object.entries(variantMappings).map(([pVarId, vData]) => ({
      id: vData.id,
      productVariantId: pVarId,
      externalVariantId: vData.externalVariantId,
      externalSku: vData.externalSku,
      mappingStatus,
    }));

    try {
      const res = await fetch("/api/admin/wearables/pod-mappings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerProduct: {
            id: existingProviderProductId,
            providerId: selectedProviderId,
            productId: selectedProductId,
            externalProductId: extProductId.trim(),
            title: providerProdTitle.trim() || undefined,
            mappingStatus,
            notes: notes.trim() || undefined,
          },
          providerVariants: variantsPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setSaveError(data.error || "Failed to save POD mapping");
      } else {
        setSaveSuccess("POD provider product & variant mappings saved successfully.");
        await fetchMappingData();
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Network error");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm font-mono text-white/50">Loading POD Provider Mappings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-zinc-900/60 p-6 rounded-lg border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded uppercase">
              Operational Metadata
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white">Print-on-Demand Provider Mapping</h2>
          </div>
          <p className="text-xs text-white/60 mt-1">
            Map internal Ascend garments & exact variant SKUs to external provider identifiers (Qikink, Printrove). Strictly internal operational data.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/80 border border-red-500/40 rounded-md text-red-200 text-xs font-mono">
          🚨 {error}
        </div>
      )}
      {saveError && (
        <div className="p-4 bg-red-950/80 border border-red-500/40 rounded-md text-red-200 text-xs font-mono">
          🚨 {saveError}
        </div>
      )}
      {saveSuccess && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 rounded-md text-emerald-200 text-xs font-mono">
          ✓ {saveSuccess}
        </div>
      )}

      {/* Mapping Configuration Form */}
      <form onSubmit={handleSaveMapping} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Provider & Garment Selection */}
          <div className="bg-zinc-900/40 border border-white/10 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-bold font-mono text-white uppercase border-b border-white/10 pb-2">
              1. Provider & Ascend Garment Selection
            </h3>

            <div>
              <label className="text-xs font-mono text-white/60 block mb-1">POD Provider *</label>
              <select
                value={selectedProviderId}
                onChange={(e) => handleProviderSelect(e.target.value)}
                className="w-full bg-black/60 border border-white/20 rounded p-2 text-xs font-mono text-white"
              >
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.slug.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-white/60 block mb-1">Ascend Garment Product *</label>
              <select
                value={selectedProductId}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full bg-black/60 border border-white/20 rounded p-2 text-xs font-mono text-white"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.slug})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-black/40 border border-white/10 rounded-md space-y-3">
              <span className="text-xs font-mono font-bold text-white/80 block uppercase">
                Provider Catalogue Identifiers
              </span>
              <div>
                <label className="text-xs font-mono text-white/60 block mb-1">External Provider Product ID *</label>
                <input
                  type="text"
                  required
                  value={extProductId}
                  onChange={(e) => setExtProductId(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded p-2 text-xs font-mono text-white"
                  placeholder="e.g. QIK-HOODIE-OVERSZD-350"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-white/60 block mb-1">Provider Product Title / Description</label>
                <input
                  type="text"
                  value={providerProdTitle}
                  onChange={(e) => setProviderProdTitle(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded p-2 text-xs font-mono text-white"
                  placeholder="e.g. Premium Heavyweight Fleece Hoodie 350 GSM"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-white/60 block mb-1">Mapping Status</label>
                  <select
                    value={mappingStatus}
                    onChange={(e) => setMappingStatus(e.target.value as MappingStatus)}
                    className="w-full bg-black/60 border border-white/20 rounded p-2 text-xs font-mono text-white"
                  >
                    <option value="unmapped">Unmapped</option>
                    <option value="draft">Draft</option>
                    <option value="mapped">Mapped</option>
                    <option value="verified">Verified (Fulfilment Ready)</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Variant SKU Mapping Grid */}
          <div className="bg-zinc-900/40 border border-white/10 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-bold font-mono text-white uppercase border-b border-white/10 pb-2">
              2. Exact Variant SKU Mapping ({selectedProduct?.variants?.length || 0} Variants)
            </h3>

            <div className="space-y-3 max-h-[380px] overflow-y-auto">
              {(selectedProduct?.variants || []).map((v) => {
                const current = variantMappings[v.id] || { externalVariantId: "", externalSku: "" };
                return (
                  <div key={v.id} className="p-3 bg-black/40 border border-white/10 rounded-md space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="font-bold text-white">
                        {v.size} / {v.color}
                      </span>
                      <span className="text-white/50 text-[10px]">Ascend SKU: {v.sku}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-mono text-white/50 block mb-1">Ext Variant ID</label>
                        <input
                          type="text"
                          value={current.externalVariantId}
                          onChange={(e) =>
                            setVariantMappings({
                              ...variantMappings,
                              [v.id]: { ...current, externalVariantId: e.target.value },
                            })
                          }
                          className="w-full bg-black/80 border border-white/20 rounded p-1.5 text-xs font-mono text-white"
                          placeholder="e.g. VAR-QIK-BLK-XL"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-white/50 block mb-1">Ext Variant SKU</label>
                        <input
                          type="text"
                          value={current.externalSku}
                          onChange={(e) =>
                            setVariantMappings({
                              ...variantMappings,
                              [v.id]: { ...current, externalSku: e.target.value },
                            })
                          }
                          className="w-full bg-black/80 border border-white/20 rounded p-1.5 text-xs font-mono text-white"
                          placeholder="e.g. QK-BLK-XL-350"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10">
              <button
                type="submit"
                disabled={saveLoading}
                className="px-6 py-2.5 bg-white text-black font-mono font-bold text-xs rounded hover:bg-white/90 transition disabled:opacity-50"
              >
                {saveLoading ? "Saving Mappings..." : "Save POD Mapping Set"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
