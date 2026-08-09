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
    designer: "",
    tags: [],
  });

  // Placement visualizer state
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || "");
  const [selectedVariantId] = useState<string>("");
  const [placementLocation, setPlacementLocation] = useState<PlacementLocation>("front");
  const [xNorm, setXNorm] = useState<number>(0.5);
  const [yNorm, setYNorm] = useState<number>(0.5);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [widthMm, setWidthMm] = useState<number>(200);
  const [heightMm, setHeightMm] = useState<number>(250);
  const [printMethod, setPrintMethod] = useState<PrintMethod>("dtf");

  // New mockup modal state
  const [mockupUrl, setMockupUrl] = useState("");
  const [mockupViewType, setMockupViewType] = useState<MockupViewType>("front");
  const [mockupIsPrimary, setMockupIsPrimary] = useState(false);

  // Form notifications
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

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

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) || products[0],
    [products, selectedProductId],
  );

  const selectedDesign = useMemo(
    () => designs.find((d) => d.id === selectedDesignId),
    [designs, selectedDesignId],
  );

  const handleSaveDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveError(null);
    setSaveSuccess(null);

    const placementData: Partial<DesignPlacement> = {
      productId: selectedProductId || undefined,
      productVariantId: selectedVariantId || undefined,
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

    const valRes = validateDesignPlacement(placementData);
    if (!valRes.isValid) {
      setSaveError(valRes.error);
      setSaveLoading(false);
      return;
    }

    try {
      const payload = {
        design: {
          id: selectedDesignId || undefined,
          ...editingDesign,
        },
        placements: [placementData],
      };

      const res = await fetch("/api/admin/wearables/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || "Failed to save design asset");
      } else {
        setSaveSuccess("Design asset & physical placement saved successfully.");
        await fetchStudioData();
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Network error");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCreateMockup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !mockupUrl.trim()) return;

    setSaveLoading(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/admin/wearables/mockups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProductId,
          variantId: selectedVariantId || undefined,
          designId: selectedDesignId || undefined,
          imageUrl: mockupUrl.trim(),
          viewType: mockupViewType,
          isPrimary: mockupIsPrimary,
          status: "draft",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || "Failed to create mockup");
      } else {
        setMockupUrl("");
        setSaveSuccess("Mockup created successfully.");
        await fetchStudioData();
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Network error");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUpdateMockupStatus = async (mockupId: string, newStatus: MockupStatus) => {
    try {
      const res = await fetch("/api/admin/wearables/mockups", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mockupId, status: newStatus }),
      });
      if (res.ok) {
        await fetchStudioData();
      }
    } catch (err) {
      console.error("Failed to update mockup status:", err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm font-mono text-white/50">Loading Ascend HQ Design Studio...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/60 p-6 rounded-lg border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded uppercase">
              Internal Production Tool
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white">Ascend HQ Design Studio</h2>
          </div>
          <p className="text-xs text-white/60 mt-1">
            Artwork asset management, garment placement, physical dimensions (mm), and visual mockup reference editor.
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex gap-1 bg-black/40 p-1 rounded-md border border-white/10">
          <button
            type="button"
            onClick={() => setSubTab("assets")}
            className={`px-3 py-1.5 text-xs font-mono rounded transition ${
              subTab === "assets" ? "bg-white text-black font-semibold" : "text-white/60 hover:text-white"
            }`}
          >
            Artwork Assets ({designs.length})
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
                  setEditingDesign({ title: "", slug: "", status: "draft", assetUrl: "" });
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
                  onClick={() => {
                    setSelectedDesignId(d.id);
                    setEditingDesign(d);
                  }}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-white/60 block mb-1">Artwork URL / Asset Key *</label>
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
                  disabled={saveLoading}
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
              {/* Garment Base Background Image */}
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

              {/* Artwork Overlay Box positioned by normalized xNorm, yNorm, scale, rotation */}
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

          {/* Placement Controls & Coordinates Form */}
          <div className="bg-zinc-900/40 border border-white/10 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-bold font-mono text-white uppercase border-b border-white/10 pb-2">
              Physical Placement & Print Specifications
            </h3>

            <form onSubmit={handleSaveDesign} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-white/60 block mb-1">Target Ascend Product *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
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
                  {saveLoading ? "Saving..." : "Update Placement & Dimensions"}
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
                <label className="text-xs font-mono text-white/60 block mb-1">Mockup Image URL *</label>
                <input
                  type="text"
                  required
                  value={mockupUrl}
                  onChange={(e) => setMockupUrl(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded p-2 text-xs font-mono text-white"
                  placeholder="https://cdn.example.com/mockups/front.jpg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-white/60 block mb-1">View Angle</label>
                  <select
                    value={mockupViewType}
                    onChange={(e) => setMockupViewType(e.target.value as MockupViewType)}
                    className="w-full bg-black/60 border border-white/20 rounded p-2 text-xs font-mono text-white"
                  >
                    <option value="front">Front View</option>
                    <option value="back">Back View</option>
                    <option value="detail">Fabric Detail</option>
                    <option value="lifestyle">Lifestyle</option>
                  </select>
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-mono text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mockupIsPrimary}
                      onChange={(e) => setMockupIsPrimary(e.target.checked)}
                    />
                    Primary Image
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={saveLoading}
                className="w-full py-2 bg-white text-black font-mono font-bold text-xs rounded hover:bg-white/90 transition mt-2"
              >
                {saveLoading ? "Saving..." : "Add Mockup Reference"}
              </button>
            </form>
          </div>

          {/* Mockups Grid */}
          <div className="lg:col-span-2 bg-zinc-900/40 border border-white/10 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-bold font-mono text-white uppercase border-b border-white/10 pb-2">
              Mockup Review & Approval Queue ({mockups.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[550px] overflow-y-auto">
              {mockups.map((m) => {
                const prod = products.find((p) => p.id === m.productId);
                return (
                  <div key={m.id} className="bg-black/40 border border-white/10 rounded p-3 space-y-2">
                    <div className="h-40 bg-zinc-950 rounded overflow-hidden flex items-center justify-center">
                      <img src={m.imageUrl} alt={m.viewType} className="h-full object-contain" />
                    </div>

                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-white font-bold">{prod?.title || "Garment"}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] uppercase ${
                          m.status === "approved"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : m.status === "rejected"
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono text-white/50">
                      <span>View: {m.viewType}</span>
                      {m.isPrimary && <span className="text-amber-400">★ Primary</span>}
                    </div>

                    {/* Status Toggle Buttons */}
                    <div className="flex gap-2 pt-1 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => handleUpdateMockupStatus(m.id, "approved")}
                        className="flex-1 py-1 text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded hover:bg-emerald-500/30"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateMockupStatus(m.id, "rejected")}
                        className="flex-1 py-1 text-[10px] font-mono bg-red-500/20 text-red-300 border border-red-500/40 rounded hover:bg-red-500/30"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
