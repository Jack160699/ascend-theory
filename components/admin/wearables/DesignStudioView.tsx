"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import type { Product } from "@/lib/wearables/types";
import type {
  DesignAsset,
  DesignPlacement,
  PlacementLocation,
  PrintMethod,
  ProductMockup,
  MockupViewType,
  MockupStatus,
} from "@/lib/wearables/design-types";
import { validateDesignPlacement } from "@/lib/wearables/placement-validator";

type DesignStudioViewProps = {
  products: Product[];
};

export function DesignStudioView({ products }: DesignStudioViewProps) {
  const [designs, setDesigns] = useState<DesignAsset[]>([]);
  const [mockups, setMockups] = useState<ProductMockup[]>([]);
  const [loading, setLoading] = useState(true);

  // Active sub-tab
  const [subTab, setSubTab] = useState<"assets" | "visualizer" | "mockups">("assets");

  // Selected design & placement state for editor/visualizer
  const [selectedDesignId, setSelectedDesignId] = useState<string>("");
  const [editingDesign, setEditingDesign] = useState<Partial<DesignAsset>>({
    title: "",
    slug: "",
    description: "",
    status: "draft",
    assetUrl: "",
    storagePath: "",
    designer: "",
    tags: [],
  });

  // Placement visualizer state
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || "");
  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);
  const [placementLocation, setPlacementLocation] = useState<PlacementLocation>("front");
  const [xNorm, setXNorm] = useState<number>(0.5);
  const [yNorm, setYNorm] = useState<number>(0.5);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [widthMm, setWidthMm] = useState<number>(200);
  const [heightMm, setHeightMm] = useState<number>(250);
  const [printMethod, setPrintMethod] = useState<PrintMethod>("dtf");

  // File upload state
  const [uploadingFile, setUploadingFile] = useState(false);

  // New mockup modal state
  const [mockupUrl, setMockupUrl] = useState("");
  const [mockupViewType, setMockupViewType] = useState<MockupViewType>("front");
  const [mockupIsPrimary, setMockupIsPrimary] = useState(false);

  // Form notifications
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) || products[0],
    [products, selectedProductId],
  );

  const selectedDesign = useMemo(
    () => designs.find((d) => d.id === selectedDesignId),
    [designs, selectedDesignId],
  );

  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod && prod.variants) {
      setSelectedVariantIds(prod.variants.map((v) => v.id));
    } else {
      setSelectedVariantIds([]);
    }
  };

  const handleSelectDesign = (d: DesignAsset) => {
    setSelectedDesignId(d.id);
    setEditingDesign(d);
    if (d.placements && d.placements.length > 0) {
      const pl = d.placements[0];
      if (pl.productId) handleProductSelect(pl.productId);
      setPlacementLocation(pl.placementLocation || "front");
      setXNorm(pl.xNormalized ?? 0.5);
      setYNorm(pl.yNormalized ?? 0.5);
      setScale(pl.scale ?? 1.0);
      setRotation(pl.rotationDeg ?? 0);
      setWidthMm(pl.widthMm ?? 200);
      setHeightMm(pl.heightMm ?? 250);
      setPrintMethod(pl.printMethod || "dtf");
    }
  };

  const fetchStudioData = useCallback(async () => {
    try {
      const [dRes, mRes] = await Promise.all([
        fetch("/api/admin/wearables/designs"),
        fetch("/api/admin/wearables/mockups"),
      ]);

      if (dRes.ok) {
        const dData = await dRes.json();
        setDesigns(dData.designs || []);
      }
      if (mRes.ok) {
        const mData = await mRes.json();
        setMockups(mData.mockups || []);
      }
    } catch (err) {
      console.error("Failed to refresh studio data:", err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetch("/api/admin/wearables/designs").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/admin/wearables/mockups").then((r) => (r.ok ? r.json() : null)),
    ]).then(([dData, mData]) => {
      if (!isMounted) return;
      if (dData?.designs) setDesigns(dData.designs);
      if (mData?.mockups) setMockups(mData.mockups);
      setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setSaveError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/wearables/designs/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Artwork upload failed");
      }

      setEditingDesign((prev) => ({
        ...prev,
        storagePath: data.storagePath,
        assetUrl: data.previewUrl || prev.assetUrl,
        mimeType: data.mimeType,
        originalFilename: data.originalFilename,
        fileSizeBytes: data.fileSizeBytes,
      }));
      setSaveSuccess(`Uploaded artwork asset: ${data.originalFilename}`);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Artwork upload failed");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSaveDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      if (!editingDesign.title || !editingDesign.slug) {
        throw new Error("Title and slug are required");
      }

      if (selectedVariantIds.length === 0) {
        throw new Error("At least one exact product variant must be selected for placement configuration");
      }

      // Build placement payloads preserving existing placement IDs
      const existingPlacements = selectedDesign?.placements || [];
      const placementsToSave: Partial<DesignPlacement>[] = selectedVariantIds.map((varId) => {
        const existingPl = existingPlacements.find(
          (p) => p.productId === selectedProductId && p.productVariantId === varId,
        );

        return {
          id: existingPl?.id,
          productId: selectedProductId,
          productVariantId: varId,
          placementLocation,
          position: placementLocation,
          xNormalized: xNorm,
          yNormalized: yNorm,
          scale,
          rotationDeg: rotation,
          widthMm,
          heightMm,
          printMethod,
          isActive: true,
        };
      });

      // Validate all placements before sending
      for (const pl of placementsToSave) {
        const valRes = validateDesignPlacement(pl);
        if (!valRes.isValid) {
          throw new Error(`Placement validation failed: ${valRes.error}`);
        }
      }

      const res = await fetch("/api/admin/wearables/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          design: {
            ...editingDesign,
            id: selectedDesignId || undefined,
          },
          placements: placementsToSave,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to save design asset");
      }

      setSaveSuccess(`Design asset '${editingDesign.title}' saved successfully with ${placementsToSave.length} variant placements.`);
      await fetchStudioData();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save design asset");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCreateMockup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      if (!selectedProductId || !mockupUrl) {
        throw new Error("Product and Image URL are required");
      }

      const res = await fetch("/api/admin/wearables/mockups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProductId,
          variantId: selectedVariantIds[0] || undefined,
          designId: selectedDesignId || undefined,
          imageUrl: mockupUrl,
          viewType: mockupViewType,
          isPrimary: mockupIsPrimary,
          status: "draft",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to create mockup");
      }

      setSaveSuccess("Mockup reference created successfully (status: draft)");
      setMockupUrl("");
      await fetchStudioData();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to create mockup");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSetMockupStatus = async (mockupId: string, status: MockupStatus) => {
    setSaveLoading(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const res = await fetch("/api/admin/wearables/mockups", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mockupId, status }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to update mockup status");
      }

      setSaveSuccess(`Mockup status updated to ${status}`);
      await fetchStudioData();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to update mockup status");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs font-mono text-white/50 animate-pulse">Loading Design Studio...</div>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER & SUB-NAVIGATION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-bold font-mono text-white uppercase tracking-wider">
            Ascend HQ — Design Studio
          </h2>
          <p className="text-xs font-mono text-white/60">
            Manage artwork assets, physical placement overlays, and product mockup references.
          </p>
        </div>

        <div className="flex bg-black/40 border border-white/10 rounded-md p-1">
          <button
            type="button"
            onClick={() => setSubTab("assets")}
            className={`px-3 py-1.5 text-xs font-mono rounded transition ${
              subTab === "assets" ? "bg-white text-black font-semibold" : "text-white/60 hover:text-white"
            }`}
          >
            Artwork Library ({designs.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab("visualizer")}
            className={`px-3 py-1.5 text-xs font-mono rounded transition ${
              subTab === "visualizer" ? "bg-white text-black font-semibold" : "text-white/60 hover:text-white"
            }`}
          >
            Placement Visualizer
          </button>
          <button
            type="button"
            onClick={() => setSubTab("mockups")}
            className={`px-3 py-1.5 text-xs font-mono rounded transition ${
              subTab === "mockups" ? "bg-white text-black font-semibold" : "text-white/60 hover:text-white"
            }`}
          >
            Mockups ({mockups.length})
          </button>
        </div>
      </div>

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

      {/* TAB 1: ARTWORK ASSETS */}
      {subTab === "assets" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Design Asset Selector List */}
          <div className="bg-zinc-900/40 border border-white/10 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <span className="text-xs font-mono uppercase text-white/60">Artwork Library</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedDesignId("");
                  setEditingDesign({ title: "", slug: "", status: "draft", assetUrl: "", storagePath: "" });
                }}
                className="px-2 py-1 text-[11px] font-mono bg-white/10 hover:bg-white/20 text-white rounded"
              >
                + New Artwork
              </button>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {designs.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleSelectDesign(d)}
                  className={`w-full text-left p-3 rounded border transition ${
                    selectedDesignId === d.id
                      ? "bg-white/10 border-white text-white"
                      : "bg-black/20 border-white/5 text-white/70 hover:border-white/20"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold font-mono">{d.title}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase ${
                        d.status === "active"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : d.status === "archived"
                          ? "bg-red-500/20 text-red-300"
                          : "bg-zinc-500/20 text-zinc-300"
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-white/40 block mt-1">slug: {d.slug}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Design Asset Form */}
          <div className="lg:col-span-2 bg-zinc-900/40 border border-white/10 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-bold font-mono text-white uppercase border-b border-white/10 pb-2">
              {selectedDesignId ? `Edit Design Asset (${selectedDesign?.title})` : "New Artwork Asset"}
            </h3>

            <form onSubmit={handleSaveDesign} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-white/60 block mb-1">Design Title *</label>
                  <input
                    type="text"
                    required
                    value={editingDesign.title || ""}
                    onChange={(e) => setEditingDesign({ ...editingDesign, title: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded p-2 text-xs font-mono text-white"
                    placeholder="e.g. Apex Core Emblem Front"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-white/60 block mb-1">Design Slug *</label>
                  <input
                    type="text"
                    required
                    value={editingDesign.slug || ""}
                    onChange={(e) => setEditingDesign({ ...editingDesign, slug: e.target.value.toLowerCase().trim() })}
                    className="w-full bg-black/60 border border-white/20 rounded p-2 text-xs font-mono text-white"
                    placeholder="apex-core-emblem-front"
                  />
                </div>
              </div>

              {/* Secure Artwork File Upload */}
              <div className="p-4 bg-black/30 border border-white/10 rounded-md space-y-2">
                <label className="text-xs font-mono text-white/80 block">Secure Artwork File Upload (PNG, JPG, WEBP, SVG ≤25MB)</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                  className="block w-full text-xs font-mono text-white/70 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-mono file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
                />
                {uploadingFile && <span className="text-[11px] font-mono text-amber-300 block">Uploading & validating artwork file...</span>}
                {editingDesign.storagePath && (
                  <span className="text-[11px] font-mono text-emerald-400 block truncate">
                    Storage Path: {editingDesign.storagePath}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-white/60 block mb-1">Preview / Asset URL</label>
                  <input
                    type="text"
                    value={editingDesign.assetUrl || ""}
                    onChange={(e) => setEditingDesign({ ...editingDesign, assetUrl: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded p-2 text-xs font-mono text-white"
                    placeholder="https://storage.example.com/artwork/emblem.png"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-white/60 block mb-1">Status</label>
                  <select
                    value={editingDesign.status || "draft"}
                    onChange={(e) => setEditingDesign({ ...editingDesign, status: e.target.value as DesignAsset["status"] })}
                    className="w-full bg-black/60 border border-white/20 rounded p-2 text-xs font-mono text-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active (Production Ready)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-white/60 block mb-1">Description / Production Notes</label>
                <textarea
                  rows={3}
                  value={editingDesign.description || ""}
                  onChange={(e) => setEditingDesign({ ...editingDesign, description: e.target.value })}
                  className="w-full bg-black/60 border border-white/20 rounded p-2 text-xs font-mono text-white"
                  placeholder="HQ production notes, color profile guidelines, screen print mesh counts."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
                <button
                  type="submit"
                  disabled={saveLoading || uploadingFile}
                  className="px-4 py-2 bg-white text-black font-mono font-bold text-xs rounded hover:bg-white/90 transition"
                >
                  {saveLoading ? "Saving..." : "Save Design Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: PLACEMENT VISUALIZER */}
      {subTab === "visualizer" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Garment Visualizer Preview Panel */}
          <div className="bg-zinc-900/40 border border-white/10 rounded-lg p-6 flex flex-col items-center justify-center min-h-[420px]">
            <span className="text-xs font-mono uppercase text-white/50 mb-4">
              Placement Overlay Preview ({selectedProduct?.title || "No Garment Selected"})
            </span>

            {/* Base Garment Mock Canvas */}
            <div className="relative w-72 h-80 bg-zinc-950 border border-white/20 rounded-lg overflow-hidden flex items-center justify-center shadow-2xl">
              {selectedProduct?.primaryImageUrl ? (
                /* eslint-disable-next-html-element-suppression */
                <img
                  src={selectedProduct.primaryImageUrl}
                  alt={selectedProduct.title}
                  className="w-full h-full object-contain opacity-70"
                />
              ) : (
                <div className="text-center font-mono text-xs text-white/30">
                  👕 [Garment Silhouette Preview]
                </div>
              )}

              {/* Artwork Overlay Box */}
              {selectedDesign?.assetUrl && (
                <div
                  className="absolute pointer-events-none border border-amber-400/80 bg-amber-500/10 transition-all flex items-center justify-center"
                  style={{
                    left: `${xNorm * 100}%`,
                    top: `${yNorm * 100}%`,
                    width: `${Math.min(70, Math.max(15, (widthMm / 400) * 100 * scale))}%`,
                    height: `${Math.min(70, Math.max(15, (heightMm / 500) * 100 * scale))}%`,
                    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                  }}
                >
                  <img
                    src={selectedDesign.assetUrl}
                    alt={selectedDesign.title}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>

            <div className="mt-4 font-mono text-[11px] text-white/60 space-x-4">
              <span>Position: {placementLocation}</span>
              <span>Physical: {widthMm}mm × {heightMm}mm</span>
              <span>Method: {printMethod.toUpperCase()}</span>
            </div>
          </div>

          {/* Placement Controls & Variant Selection Form */}
          <div className="bg-zinc-900/40 border border-white/10 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-bold font-mono text-white uppercase border-b border-white/10 pb-2">
              Physical Placement & Exact Variant Selection
            </h3>

            <form onSubmit={handleSaveDesign} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-white/60 block mb-1">Target Ascend Product *</label>
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

              {/* Exact Variant Selection Checkbox List */}
              <div className="p-3 bg-black/40 border border-white/10 rounded-md space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono text-white/80 block">Applicable Product Variants *</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedVariantIds.length === (selectedProduct?.variants || []).length) {
                        setSelectedVariantIds([]);
                      } else {
                        setSelectedVariantIds((selectedProduct?.variants || []).map((v) => v.id));
                      }
                    }}
                    className="text-[10px] font-mono text-amber-300 hover:underline"
                  >
                    {selectedVariantIds.length === (selectedProduct?.variants || []).length ? "Deselect All" : "Select All"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                  {(selectedProduct?.variants || []).map((v) => (
                    <label key={v.id} className="flex items-center space-x-2 text-xs font-mono text-white/80 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedVariantIds.includes(v.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedVariantIds((prev) => [...prev, v.id]);
                          } else {
                            setSelectedVariantIds((prev) => prev.filter((id) => id !== v.id));
                          }
                        }}
                        className="rounded bg-black border-white/20"
                      />
                      <span>{v.size} / {v.color} ({v.sku})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-white/60 block mb-1">Placement Location</label>
                  <select
                    value={placementLocation}
                    onChange={(e) => setPlacementLocation(e.target.value as PlacementLocation)}
                    className="w-full bg-black/60 border border-white/20 rounded p-2 text-xs font-mono text-white"
                  >
                    <option value="front">Front Center</option>
                    <option value="back">Back Center</option>
                    <option value="left_chest">Left Chest</option>
                    <option value="right_chest">Right Chest</option>
                    <option value="left_sleeve">Left Sleeve</option>
                    <option value="right_sleeve">Right Sleeve</option>
                    <option value="neck">Inner Neck Label</option>
                    <option value="custom">Custom Position</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-mono text-white/60 block mb-1">Print Technique</label>
                  <select
                    value={printMethod}
                    onChange={(e) => setPrintMethod(e.target.value as PrintMethod)}
                    className="w-full bg-black/60 border border-white/20 rounded p-2 text-xs font-mono text-white"
                  >
                    <option value="dtf">DTF (Direct to Film)</option>
                    <option value="dtg">DTG (Direct to Garment)</option>
                    <option value="screen_print">Screen Print</option>
                    <option value="embroidery">Embroidery</option>
                    <option value="sublimation">Sublimation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Physical Dimension Inputs in mm */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-black/30 border border-white/10 rounded-md">
                <div>
                  <label className="text-xs font-mono text-white/80 block mb-1">Physical Width (mm) *</label>
                  <input
                    type="number"
                    min={1}
                    max={600}
                    value={widthMm}
                    onChange={(e) => setWidthMm(parseInt(e.target.value) || 0)}
                    className="w-full bg-black/60 border border-white/20 rounded p-2 text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-white/80 block mb-1">Physical Height (mm) *</label>
                  <input
                    type="number"
                    min={1}
                    max={800}
                    value={heightMm}
                    onChange={(e) => setHeightMm(parseInt(e.target.value) || 0)}
                    className="w-full bg-black/60 border border-white/20 rounded p-2 text-xs font-mono text-white"
                  />
                </div>
              </div>

              {/* Sliders for Normalized Positioning, Scale, Rotation */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-mono text-white/60 mb-1">
                    <span>X Position (Horizontal)</span>
                    <span>{(xNorm * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={xNorm}
                    onChange={(e) => setXNorm(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-mono text-white/60 mb-1">
                    <span>Y Position (Vertical)</span>
                    <span>{(yNorm * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={yNorm}
                    onChange={(e) => setYNorm(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs font-mono text-white/60 mb-1">
                      <span>Scale Ratio</span>
                      <span>{scale.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min={0.2}
                      max={3.0}
                      step={0.05}
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-mono text-white/60 mb-1">
                      <span>Rotation (deg)</span>
                      <span>{rotation}°</span>
                    </div>
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      step={1}
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value) || 0)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saveLoading || !selectedDesignId}
                  className="px-4 py-2 bg-white text-black font-mono font-bold text-xs rounded hover:bg-white/90 transition"
                >
                  {saveLoading ? "Saving..." : "Update Variant Placements"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: MOCKUP MANAGER */}
      {subTab === "mockups" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Mockup Panel */}
          <div className="bg-zinc-900/40 border border-white/10 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-bold font-mono text-white uppercase border-b border-white/10 pb-2">
              New Garment Mockup Reference
            </h3>

            <form onSubmit={handleCreateMockup} className="space-y-3">
              <div>
                <label className="text-xs font-mono text-white/60 block mb-1">Product *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded p-2 text-xs font-mono text-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-white/60 block mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  value={mockupUrl}
                  onChange={(e) => setMockupUrl(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded p-2 text-xs font-mono text-white"
                  placeholder="https://cdn.ascendtheory.com/mockups/jacket-front.jpg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-white/60 block mb-1">View Type</label>
                  <select
                    value={mockupViewType}
                    onChange={(e) => setMockupViewType(e.target.value as MockupViewType)}
                    className="w-full bg-black/60 border border-white/20 rounded p-2 text-xs font-mono text-white"
                  >
                    <option value="front">Front</option>
                    <option value="back">Back</option>
                    <option value="detail">Detail</option>
                    <option value="lifestyle">Lifestyle</option>
                  </select>
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center space-x-2 text-xs font-mono text-white/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mockupIsPrimary}
                      onChange={(e) => setMockupIsPrimary(e.target.checked)}
                      className="rounded bg-black border-white/20"
                    />
                    <span>Is Primary</span>
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="w-full py-2 bg-white text-black font-mono font-bold text-xs rounded hover:bg-white/90 transition"
                >
                  {saveLoading ? "Saving..." : "Create Mockup (Draft)"}
                </button>
              </div>
            </form>
          </div>

          {/* Mockups Review Grid */}
          <div className="lg:col-span-2 bg-zinc-900/40 border border-white/10 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-bold font-mono text-white uppercase border-b border-white/10 pb-2">
              Product Mockups Queue ({mockups.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
              {mockups.map((m) => (
                <div key={m.id} className="bg-black/40 border border-white/10 rounded-md p-3 space-y-2 flex flex-col justify-between">
                  <div className="flex gap-3">
                    <div className="w-16 h-20 bg-zinc-950 border border-white/10 rounded overflow-hidden flex-shrink-0">
                      {/* eslint-disable-next-html-element-suppression */}
                      <img src={m.imageUrl} alt={m.viewType} className="w-full h-full object-contain" />
                    </div>
                    <div className="space-y-1 font-mono text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white uppercase">{m.viewType} View</span>
                        {m.isPrimary && <span className="bg-amber-400 text-black font-bold text-[9px] px-1 rounded">PRIMARY</span>}
                      </div>
                      <span className="text-[10px] text-white/50 block">ID: {m.id.slice(0, 8)}...</span>
                      <span
                        className={`inline-block text-[9px] px-1.5 py-0.5 rounded uppercase ${
                          m.status === "approved"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : m.status === "rejected"
                            ? "bg-red-500/20 text-red-300"
                            : "bg-zinc-500/20 text-zinc-300"
                        }`}
                      >
                        Status: {m.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => handleSetMockupStatus(m.id, "approved")}
                      disabled={saveLoading || m.status === "approved"}
                      className="flex-1 py-1 text-[10px] font-mono font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded transition disabled:opacity-30"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetMockupStatus(m.id, "rejected")}
                      disabled={saveLoading || m.status === "rejected"}
                      className="flex-1 py-1 text-[10px] font-mono font-bold bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded transition disabled:opacity-30"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
