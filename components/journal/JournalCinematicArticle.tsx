"use client";

import { JournalMinimalNav } from "@/components/journal/JournalMinimalNav";
import { JournalScene } from "@/components/journal/JournalScene";
import { useJournalMagazineLenis } from "@/components/journal/use-journal-magazine-lenis";
import type { JournalArticle } from "@/lib/data/journal";
import { BRAND_ROUTES } from "@/lib/brand/routes";
import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type JournalCinematicArticleProps = {
  article: JournalArticle;
};

export function JournalCinematicArticle({ article }: JournalCinematicArticleProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null);
  const reduce = useReducedMotion();

  useJournalMagazineLenis(viewportRef, contentRef, !reduce);

  useEffect(() => {
    document.documentElement.classList.add("journal-immersive-active");
    document.body.classList.add("journal-immersive-active");
    return () => {
      document.documentElement.classList.remove("journal-immersive-active");
      document.body.classList.remove("journal-immersive-active");
    };
  }, []);

  return (
    <div className="journal-immersive">
      <JournalMinimalNav
        backHref={BRAND_ROUTES.journal}
        backLabel="Journal"
      />
      <div
        ref={viewportRef}
        className={
          reduce
            ? "journal-immersive__viewport"
            : "journal-immersive__viewport journal-immersive__viewport--lenis"
        }
      >
        <div
          ref={(node) => {
            contentRef.current = node;
            setScrollRoot(node);
          }}
          className={
            reduce ? "journal-magazine" : "journal-magazine journal-magazine--lenis"
          }
        >
          {article.scenes.map((scene, index) => (
            <JournalScene
              key={scene.id}
              scene={scene}
              index={index}
              scrollRoot={scrollRoot}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
