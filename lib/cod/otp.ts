/**
 * Phase 7 — Authoritative Cryptographic OTP Challenge Manager (Requirements #14, #15, #16, #17)
 * Uses HMAC-SHA256 with server-side pepper, 10-min expiry, 3 max attempts,
 * durable resend throttling (60s cooldown, 3 max sends), token binding, and atomic RPC verification.
 */

import crypto from "node:crypto";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type { CodOtpChallenge } from "./types";

const memoryOtpChallenges = new Map<string, CodOtpChallenge>();
const memoryResendTracker = new Map<string, { lastSentAt: number; count: number }>();

/**
 * Normalizes phone number to canonical E.164 / Indian format (e.g. +919999999999)
 */
export function normalizePhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }
  return digits ? `+${digits}` : "";
}

/**
 * Computes HMAC-SHA256 hash of raw OTP text using a server-side pepper. Raw OTP is NEVER saved in DB or logs.
 */
export function hashOtp(otpText: string, customPepper?: string): string {
  const pepper = customPepper || process.env.COD_OTP_PEPPER || "ascend_cod_otp_default_pepper_2026";
  return crypto.createHmac("sha256", pepper).update(otpText.trim()).digest("hex");
}

/**
 * Generates 6-digit OTP using cryptographically secure random number generator.
 */
export function generateSecureOtpText(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Creates durable OTP challenge for an order with resend throttling.
 */
export async function createOtpChallengeAdmin(
  orderId: string,
  rawPhone: string,
  customPepper?: string,
): Promise<{ ok: true; challenge: CodOtpChallenge; otpText: string } | { ok: false; error: string }> {
  const phoneNormalized = normalizePhone(rawPhone);
  if (!phoneNormalized || phoneNormalized.length < 10) {
    return { ok: false, error: "invalid_phone_number" };
  }

  const nowMs = Date.now();
  const now = new Date(nowMs);

  // Check resend throttling (Requirement #15)
  if (hasSupabaseConfig()) {
    const supabase = createSupabaseServiceClient();
    if (!supabase) return { ok: false, error: "Supabase service client unconfigured" };

    const { data: recentChallenges, error: recentErr } = await supabase
      .from("cod_otp_challenges")
      .select("created_at, resend_count")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (!recentErr && recentChallenges && recentChallenges.length > 0) {
      const latest = recentChallenges[0]!;
      const elapsedMs = nowMs - new Date(latest.created_at).getTime();

      if (elapsedMs < 60 * 1000) {
        return { ok: false, error: "otp_resend_cooldown_active" };
      }

      if (latest.resend_count >= 3) {
        return { ok: false, error: "max_otp_resend_limit_exceeded" };
      }
    }
  } else {
    const tracker = memoryResendTracker.get(orderId);
    if (tracker) {
      if (nowMs - tracker.lastSentAt < 60 * 1000) {
        return { ok: false, error: "otp_resend_cooldown_active" };
      }
      if (tracker.count >= 3) {
        return { ok: false, error: "max_otp_resend_limit_exceeded" };
      }
    }
  }

  const otpText = generateSecureOtpText();
  const otpHash = hashOtp(otpText, customPepper);
  const expiresAt = new Date(nowMs + 10 * 60 * 1000).toISOString(); // 10 minutes expiry
  const challengeId = crypto.randomUUID();

  if (hasSupabaseConfig()) {
    const supabase = createSupabaseServiceClient();
    if (!supabase) return { ok: false, error: "Supabase service client unconfigured" };

    // Invalidate previous unverified challenges for this order
    await supabase
      .from("cod_otp_challenges")
      .update({ consumed_at: now.toISOString() })
      .eq("order_id", orderId)
      .is("consumed_at", null);

    const { data: recent } = await supabase
      .from("cod_otp_challenges")
      .select("resend_count")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })
      .limit(1);

    const nextResendCount = recent && recent.length > 0 ? recent[0]!.resend_count + 1 : 1;

    const { error } = await supabase.from("cod_otp_challenges").insert({
      id: challengeId,
      order_id: orderId,
      phone_normalized: phoneNormalized,
      otp_hash: otpHash,
      expires_at: expiresAt,
      attempts: 0,
      max_attempts: 3,
      resend_count: nextResendCount,
      sent_at: now.toISOString(),
      created_at: now.toISOString(),
    });

    if (error) {
      return { ok: false, error: `Database error creating OTP challenge: ${error.message}` };
    }
  } else {
    const tracker = memoryResendTracker.get(orderId);
    const nextCount = tracker ? tracker.count + 1 : 1;
    memoryResendTracker.set(orderId, { lastSentAt: nowMs, count: nextCount });

    const challengeRecord: CodOtpChallenge = {
      id: challengeId,
      orderId,
      phoneNormalized,
      otpHash,
      expiresAt,
      attemptCount: 0,
      maxAttempts: 3,
      createdAt: now.toISOString(),
    };
    memoryOtpChallenges.set(orderId, challengeRecord);
  }

  const challengeRecord: CodOtpChallenge = {
    id: challengeId,
    orderId,
    phoneNormalized,
    otpHash,
    expiresAt,
    attemptCount: 0,
    maxAttempts: 3,
    createdAt: now.toISOString(),
  };

  return { ok: true, challenge: challengeRecord, otpText };
}

/**
 * Verifies submitted OTP for an order single-use and rate-limited via atomic RPC.
 */
export async function verifyOtpChallengeAdmin(
  orderId: string,
  submittedOtp: string,
  confirmationToken?: string,
  customPepper?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const submittedHash = hashOtp(submittedOtp, customPepper);

  let tokenHash: string | undefined = undefined;
  if (confirmationToken) {
    tokenHash = crypto.createHash("sha256").update(confirmationToken).digest("hex");
  }

  if (hasSupabaseConfig()) {
    const supabase = createSupabaseServiceClient();
    if (!supabase) {
      return { ok: false, error: "Supabase service client unconfigured" };
    }

    const { data, error } = await supabase.rpc("verify_cod_otp_challenge_with_audit", {
      p_order_id: orderId,
      p_submitted_otp_hash: submittedHash,
      p_token_hash: tokenHash || null,
    });

    if (error) {
      console.error("[OTP] RPC error verifying OTP challenge:", error);
      return { ok: false, error: error.message };
    }

    if (!data.ok) {
      return { ok: false, error: data.error };
    }

    return { ok: true };
  }

  // Memory fallback for dev/testing
  const challenge = memoryOtpChallenges.get(orderId) || null;
  if (!challenge) {
    return { ok: false, error: "otp_challenge_not_found" };
  }

  if (challenge.consumedAt || challenge.verifiedAt) {
    return { ok: false, error: "otp_already_consumed" };
  }

  const nowIso = new Date().toISOString();
  if (challenge.expiresAt < nowIso) {
    return { ok: false, error: "otp_expired" };
  }

  if (challenge.attemptCount >= challenge.maxAttempts) {
    return { ok: false, error: "otp_max_attempts_exceeded" };
  }

  if (challenge.otpHash !== submittedHash) {
    challenge.attemptCount += 1;
    memoryOtpChallenges.set(orderId, challenge);

    if (challenge.attemptCount >= challenge.maxAttempts) {
      return { ok: false, error: "otp_max_attempts_exceeded" };
    }
    return { ok: false, error: "invalid_otp" };
  }

  challenge.verifiedAt = nowIso;
  challenge.consumedAt = nowIso;
  memoryOtpChallenges.set(orderId, challenge);

  return { ok: true };
}
