import { PORTAL_LINKS } from "@/lib/brand/routes";
import Link from "next/link";

type PageExploreLinksProps = {
  /** Exclude current page from the list */
  excludeHref?: string;
};

export function PageExploreLinks({ excludeHref }: PageExploreLinksProps) {
  const links = excludeHref
    ? PORTAL_LINKS.filter((item) => item.href !== excludeHref)
    : PORTAL_LINKS;

  return (
    <nav className="page-explore" aria-label="Explore the brand">
      <p className="brand-eyebrow">Explore</p>
      <ul className="page-explore__list">
        {links.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="page-explore__link group">
              <span>{item.label}</span>
              <span className="page-explore__arrow" aria-hidden>
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
