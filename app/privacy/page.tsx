import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { legalH2, legalList, legalP } from "@/components/legal/legal-typography";

export const metadata: Metadata = {
  title: "Privacy — Ascend Theory",
  description:
    "How Ascend Theory handles information for a private mentorship practice — minimal, intentional, human.",
};

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy" updatedLabel="Last reviewed · May 2026">
      <section>
        <h2 className={legalH2}>Scope</h2>
        <p className={legalP}>
          Ascend Theory operates as a small, selective mentorship practice. This
          page describes, in plain language, what we collect, why we collect it,
          and how we respect your attention.
        </p>
      </section>
      <section>
        <h2 className={legalH2}>What we receive</h2>
        <p className={legalP}>
          When you reach out or move through intake, we may receive information
          you choose to share: contact details, professional context, and any
          narrative you offer to help us evaluate fit. Technical signals (such as
          basic analytics or device data) may be processed by our hosting and
          tooling providers in order to keep the site reliable and secure.
        </p>
      </section>
      <section>
        <h2 className={legalH2}>How we use it</h2>
        <ul className={legalList}>
          <li>To respond to you and assess whether mentorship is appropriate.</li>
          <li>To operate, secure, and improve this website.</li>
          <li>To meet legal obligations where they genuinely apply.</li>
        </ul>
        <p className={legalP}>
          We do not sell personal information. We do not run aggressive
          retargeting. If something changes materially, this page will be updated
          and dated accordingly.
        </p>
      </section>
      <section>
        <h2 className={legalH2}>Retention</h2>
        <p className={legalP}>
          We keep correspondence and intake notes only as long as needed for the
          relationship, our records, or law. When data is no longer required, it is
          deleted or anonymised in line with our internal practice standards.
        </p>
      </section>
      <section>
        <h2 className={legalH2}>Your choices</h2>
        <p className={legalP}>
          Depending on where you live, you may have rights to access, correct, or
          delete certain information. If you would like to exercise those rights,
          write to us using the contact channel published on the main site. We
          will respond thoughtfully and without theatre.
        </p>
      </section>
      <section>
        <h2 className={legalH2}>Contact</h2>
        <p className={legalP}>
          Questions about this policy belong in direct correspondence — not in a
          ticket queue. Use the primary contact pathway provided on the homepage.
        </p>
      </section>
    </LegalPageShell>
  );
}
