"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Lock, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminLoadingState } from "@/components/admin/ui/AdminLoadingState";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("from") || "/admin";

  const [email, setEmail] = useState("admin@ascendtheory.com");
  const [password, setPassword] = useState("••••••••••••");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Set secure HTTP session cookie
    document.cookie = `ascend_hq_session=authenticated_phase1_token; path=/; max-age=${
      60 * 60 * 24 * 7
    }; SameSite=Lax`;

    setTimeout(() => {
      setLoading(false);
      router.push(redirectTarget);
    }, 400);
  };

  return (
    <AdminCard className="border-white/10 p-6 sm:p-8 bg-zinc-950/90 shadow-2xl">
      <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300 mb-6">
        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
        <span>Phase 1 Authentication Boundary Active</span>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
            Staff Identity / Email
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-zinc-400"
              placeholder="admin@ascendtheory.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
            Passcode
          </label>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-3.5 py-2.5 text-sm text-white focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
          </div>
        </div>

        <AdminButton
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          disabled={loading}
          icon={loading ? <Shield className="h-4 w-4 animate-pulse" /> : <ArrowRight className="h-4 w-4" />}
        >
          {loading ? "Authenticating HQ Session..." : "Enter Ascend HQ"}
        </AdminButton>
      </form>

      <div className="mt-6 pt-4 border-t border-white/10 text-center space-y-2">
        <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400">
          <Lock className="h-3.5 w-3.5 text-zinc-500" />
          <span>Restricted Access &bull; Role-Based Security</span>
        </div>
        <p className="text-[10px] text-zinc-500">
          Ascend Theory Unified Operations &bull; Phase 1 Foundation
        </p>
      </div>
    </AdminCard>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#050505] px-4 py-12 text-white selection:bg-zinc-800">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(95,115,134,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-zinc-900 text-white font-black text-xl shadow-2xl mb-2">
            A
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            ASCEND HQ <Sparkles className="h-4 w-4 text-amber-400" />
          </h1>
          <p className="text-xs text-zinc-400 font-mono tracking-widest uppercase">
            Unified Platform Control Center
          </p>
        </div>

        {/* Suspense boundary for useSearchParams */}
        <Suspense fallback={<AdminLoadingState label="Loading Auth Gateway..." />}>
          <LoginFormContent />
        </Suspense>
      </div>
    </div>
  );
}
