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
  const [extProductId, setExtProductId] = useState("");
  const [providerProdTitle, setProviderProdTitle] = useState("");
  const [mappingStatus, setMappingStatus] = useState<MappingStatus>("mapped");
  const [notes, setNotes] = useState("");

  // Variant mappings dictionary: productVariantId -> externalVariantId & externalSku
  const [variantMappings, setVariantMappings] = useState<
    Record<string, { externalVariantId: string; externalSku: string }>
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
        setExtProductId(existingPP.externalProductId || "");
        setProviderProdTitle(existingPP.title || existingPP.name || "");
        setMappingStatus(existingPP.mappingStatus || "mapped");
        setNotes(existingPP.notes || "");

        const mappedVars = providerVariants.filter((pv) => pv.providerProductId === existingPP.id);
        const mapDict: Record<string, { externalVariantId: string; externalSku: string }> = {};
        mappedVars.forEach((v) => {
          if (v.productVariantId) {
            mapDict[v.productVariantId] = {
              externalVariantId: v.externalVariantId,
              externalSku: v.externalSku || v.sku || "",
            };
          }
        });
        setVariantMappings(mapDict);
      } else {
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
      if (!res.ok) {
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-white/60 block mb-1">Provider External Product ID *</label>
                <input
                  type="text"
                  required
                  value={extProductId}
                  onChange={(e) => setExtProductId(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded p-2 text-xs font-mono text-white"
                  placeholder="e.g. QIK-OVERSIZED-TEE-240"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-white/60 block mb-1">Provider Product Title</label>
                <input
                  type="text"
                  value={providerProdTitle}
                  onChange={(e) => setProviderProdTitle(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded p-2 text-xs font-mono text-white"
                  placeholder="Qikink Heavyweight Oversized Tee"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-white/60 block mb-1">Mapping Verification Status</label>
                <select
                  value={mappingStatus}
                  onChange={(e) => setMappingStatus(e.target.value as MappingStatus)}
                  className="w-full bg-black/60 border border-white/20 rounded p-2 text-xs font-mono text-white"
                >
                  <option value="unmapped">Unmapped</option>
                  <option value="mapped">Mapped (Draft)</option>
                  <option value="verified">Verified (Sample Tested)</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-mono text-white/60 block mb-1">Internal Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded p-2 text-xs font-mono text-white"
                  placeholder="Internal sample notes, fabric weight match verification."
                />
              </div>
            </div>
          </div>

          {/* Exact Variant Matrix Mapping */}
          <div className="bg-zinc-900/40 border border-white/10 rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h3 className="text-sm font-bold font-mono text-white uppercase">
                2. Exact Variant Matrix Mapping ({selectedProduct?.title})
              </h3>
              <span className="text-[11px] font-mono text-white/50">
                Each Ascend SKU maps to 1 Provider External Variant
              </span>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {(selectedProduct?.variants || []).map((v) => {
                const currentMap = variantMappings[v.id] || { externalVariantId: "", externalSku: "" };
                return (
                  <div
                    key={v.id}
                    className="p-3 bg-black/40 border border-white/10 rounded space-y-2 text-xs font-mono"
                  >
                    <div className="flex justify-between items-center text-white">
                      <span className="font-bold">
                        {v.size} / {v.colorDisplay || v.color} ({v.sku})
                      </span>
                      <span className="text-[10px] text-white/50">ID: {v.id}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-white/40 block">External Variant ID</span>
                        <input
                          type="text"
                          value={currentMap.externalVariantId}
                          onChange={(e) =>
                            setVariantMappings({
                              ...variantMappings,
                              [v.id]: { ...currentMap, externalVariantId: e.target.value },
                            })
                          }
                          className="w-full bg-zinc-900 border border-white/20 rounded p-1.5 text-xs font-mono text-white"
                          placeholder="e.g. QIK-VAR-BLK-M"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-white/40 block">External SKU</span>
                        <input
                          type="text"
                          value={currentMap.externalSku}
                          onChange={(e) =>
                            setVariantMappings({
                              ...variantMappings,
                              [v.id]: { ...currentMap, externalSku: e.target.value },
                            })
                          }
                          className="w-full bg-zinc-900 border border-white/20 rounded p-1.5 text-xs font-mono text-white"
                          placeholder="e.g. QIK-SKU-BLK-M"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="submit"
            disabled={saveLoading}
            className="px-6 py-2.5 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider rounded hover:bg-white/90 transition shadow-lg"
          >
            {saveLoading ? "Saving..." : "Save POD Provider Mapping"}
          </button>
        </div>
      </form>
    </div>
  );
}
