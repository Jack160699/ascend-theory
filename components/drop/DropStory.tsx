import { DROP_PRODUCT } from "@/lib/brand/drop-product";
import { DropFade } from "./DropFade";

export function DropStory() {
  return (
    <DropFade>
      <section className="drop-section" aria-labelledby="drop-story-heading">
        <div className="drop-shell max-w-3xl">
          <p className="brand-eyebrow">The story</p>
          <h2 id="drop-story-heading" className="brand-display mt-8">
            {DROP_PRODUCT.story.headline}
          </h2>
          <div className="mt-10 space-y-6">
            {DROP_PRODUCT.story.body.map((paragraph) => (
              <p key={paragraph} className="brand-body max-w-xl text-pretty">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>
    </DropFade>
  );
}
