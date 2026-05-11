import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { legalH2, legalList, legalP } from "@/components/legal/legal-typography";

export const metadata: Metadata = {
  title: "Terms — Ascend Theory",
  description:
    "Terms of participation for Ascend Theory — clear boundaries for a private mentorship engagement.",
};

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms" updatedLabel="Last reviewed · May 2026">
      <section>
        <h2 className={legalH2}>Agreement</h2>
        <p className={legalP}>
          By using this website or submitting an inquiry, you agree to these
          terms. They are written to be readable. If something is unclear, ask
          before you commit.
        </p>
      </section>
      <section>
        <h2 className={legalH2}>Nature of the work</h2>
        <p className={legalP}>
          Ascend Theory offers mentorship and strategic counsel — not therapy,
          not clinical treatment, and not a guarantee of outcomes. You remain
          responsible for your decisions, your business, and your life.
        </p>
      </section>
      <section>
        <h2 className={legalH2}>Selectivity</h2>
        <p className={legalP}>
          Intake is manual. Acceptance is limited. A declined application is not a
          personal judgment; it is a capacity and fit decision.
        </p>
      </section>
      <section>
        <h2 className={legalH2}>Conduct</h2>
        <ul className={legalList}>
          <li>Honour confidentiality inside the room.</li>
          <li>Engage in good faith — no harassment, exploitation, or misuse.</li>
          <li>Respect boundaries set by the practice.</li>
        </ul>
      </section>
      <section>
        <h2 className={legalH2}>Intellectual property</h2>
        <p className={legalP}>
          Materials shared with you are for your private use within the
          engagement unless otherwise agreed in writing. The site’s content,
          framing, and brand assets remain ours.
        </p>
      </section>
      <section>
        <h2 className={legalH2}>Liability</h2>
        <p className={legalP}>
          To the extent permitted by law, Ascend Theory’s liability is limited to
          fees paid for the specific engagement in question. We are not liable
          for indirect or consequential losses.
        </p>
      </section>
      <section>
        <h2 className={legalH2}>Governing approach</h2>
        <p className={legalP}>
          Substantive disputes should be resolved through direct conversation
          first. Where formal law applies, the governing jurisdiction will follow
          the written agreement signed at onboarding — not boilerplate selected
          at random on a website.
        </p>
      </section>
    </LegalPageShell>
  );
}
