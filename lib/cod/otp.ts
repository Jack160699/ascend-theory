/**
 * Phase 7 — Authoritative Cryptographic OTP Challenge Manager (Requirement #9)
 * Generates 6-digit secure random OTP, stores SHA-256 hash only, enforces 10-min expiry,
 * 3 max attempts, rate-limiting, and single-use verification.
 */

import crypto from "node:crypto";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type { CodOtpChallenge } from "./types";

const memoryOtpChallenges = new Map<string, CodOtpChallenge>();

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
 * Computes SHA-256 hash of raw OTP text. Raw OTP is NEVER saved in DB or logs.
 */
export function hashOtp(otpText: string): string {
  return crypto.createHash("sha256").update(otpText.trim()).digest("hex");
}

/**
 * Generates 6-digit OTP using cryptographically secure random number generator.
 */
export function generateSecureOtpText(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Creates durable OTP challenge for an order.
 */
export async function createOtpChallengeAdmin(
  orderId: string,
  rawPhone: string,
): Promise<{ ok: true; challenge: CodOtpChallenge; otpText: string } | { ok: false; error: string }> {
  const phoneNormalized = normalizePhone(rawPhone);
  if (!phoneNormalized || phoneNormalized.length < 10) {
    return { ok: false, error: "invalid_phone_number" };
  }

  const otpText = generateSecureOtpText();
  const otpHash = hashOtp(otpText);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString(); // 10 minutes expiry

  const challengeId = crypto.randomUUID();

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

  if (hasSupabaseConfig()) {
    const supabase = createSupabaseServiceClient();
    if (!supabase) {
      return { ok: false, error: "Supabase service client unconfigured" };
    }

    const { error } = await supabase.from("cod_otp_challenges").insert({
      id: challengeId,
      order_id: orderId,
      phone_normalized: phoneNormalized,
      otp_hash: otpHash,
      expires_at: expiresAt,
      attempt_count: 0,
      max_attempts: 3,
      created_at: now.toISOString(),
    });

    if (error) {
      return { ok: false, error: `Database error creating OTP challenge: ${error.message}` };
    }
  } else {
    memoryOtpChallenges.set(orderId, challengeRecord);
  }

  return { ok: true, challenge: challengeRecord, otpText };
}

/**
 * Verifies submitted OTP for an order single-use and rate-limited.
 */
export async function verifyOtpChallengeAdmin(
  orderId: string,
  submittedOtp: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const nowIso = new Date().toISOString();
  const submittedHash = hashOtp(submittedOtp);

  let challenge: CodOtpChallenge | null = null;

  if (hasSupabaseConfig()) {
    const supabase = createSupabaseServiceClient();
    if (!supabase) {
      return { ok: false, error: "Supabase service client unconfigured" };
    }

    const { data, error } = await supabase
      .from("cod_otp_challenges")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return { ok: false, error: "otp_challenge_not_found" };
    }

    challenge = {
      id: data.id,
      orderId: data.order_id,
      phoneNormalized: data.phone_normalized,
      otpHash: data.otp_hash,
      expiresAt: data.expires_at,
      attemptCount: data.attempt_count,
      maxAttempts: data.max_attempts,
      verifiedAt: data.verified_at,
      consumedAt: data.consumed_at,
      createdAt: data.created_at,
    };
  } else {
    challenge = memoryOtpChallenges.get(orderId) || null;
  }

  if (!challenge) {
    return { ok: false, error: "otp_challenge_not_found" };
  }

  if (challenge.consumedAt || challenge.verifiedAt) {
    return { ok: false, error: "otp_already_consumed" };
  }

  if (challenge.expiresAt < nowIso) {
    return { ok: false, error: "otp_expired" };
  }

  if (challenge.attemptCount >= challenge.maxAttempts) {
    return { ok: false, error: "otp_max_attempts_exceeded" };
  }

  if (challenge.otpHash !== submittedHash) {
    const newAttemptCount = challenge.attemptCount + 1;
    if (hasSupabaseConfig()) {
      const supabase = createSupabaseServiceClient();
      if (supabase) {
        await supabase
          .from("cod_otp_challenges")
          .update({ attempt_count: newAttemptCount })
          .eq("id", challenge.id);
      }
    } else {
      challenge.attemptCount = newAttemptCount;
      memoryOtpChallenges.set(orderId, challenge);
    }

    if (newAttemptCount >= challenge.maxAttempts) {
      return { ok: false, error: "otp_max_attempts_exceeded" };
    }
    return { ok: false, error: "invalid_otp" };
  }

  // OTP match verified -> mark consumed
  if (hasSupabaseConfig()) {
    const supabase = createSupabaseServiceClient();
    if (supabase) {
      await supabase
        .from("cod_otp_challenges")
        .update({ verified_at: nowIso, consumed_at: nowIso })
        .eq("id", challenge.id);
    }
  } else {
    challenge.verifiedAt = nowIso;
    challenge.consumedAt = nowIso;
    memoryOtpChallenges.set(orderId, challenge);
  }

  return { ok: true };
}
