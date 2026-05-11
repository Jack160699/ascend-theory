import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { legalH2, legalList, legalP } from "@/components/legal/legal-typography";

export const metadata: Metadata = {
  title: "Refunds — Ascend Theory",
  description:
    "Refund and cancellation posture for Ascend Theory — fair, finite, aligned with a private practice.",
};

export default function RefundsPage() {
  return (
    <LegalPageShell title="Refunds" updatedLabel="Last reviewed · May 2026">
      <section>
        <h2 className={legalH2}>Principle</h2>
        <p className={legalP}>
          Mentorship is time-bound and relational. Refunds are therefore
          structured to be fair to both sides — neither a loophole for buyer’s
          remorse nor a trap door for the practice.
        </p>
      </section>
      <section>
        <h2 className={legalH2}>Before work begins</h2>
        <p className={legalP}>
          If you withdraw before the engagement formally opens and no substantive
          deliverables have been produced, any prepaid amount may be returned
          minus a small administrative reserve to cover intake and scheduling
          costs. The exact figure will mirror what is stated in your offer or
          contract.
        </p>
      </section>
      <section>
        <h2 className={legalH2}>After work begins</h2>
        <p className={legalP}>
          Once sessions or deep work blocks have commenced, refunds are generally
          partial and calculated against unused portions of the agreement. This
          reflects calendar held, preparation, and opportunity cost.
        </p>
      </section>
      <section>
        <h2 className={legalH2}>Non-refundable cases</h2>
        <ul className={legalList}>
          <li>Work already delivered or clearly in progress.</li>
          <li>Violations of the terms of participation.</li>
          <li>No-shows without timely notice as defined in your agreement.</li>
        </ul>
      </section>
      <section>
        <h2 className={legalH2}>How to request</h2>
        <p className={legalP}>
          Send a single, direct note through the same channel used for
          onboarding. We will confirm receipt and respond with a clear timeline —
          usually within a few business days, not an automated ticket forest.
        </p>
      </section>
      <section>
        <h2 className={legalH2}>Note</h2>
        <p className={legalP}>
          This page summarises posture. Your signed engagement letter (if any)
          prevails where numbers or windows differ. Have counsel review that
          document if you need legal certainty.
        </p>
      </section>
    </LegalPageShell>
  );
}
