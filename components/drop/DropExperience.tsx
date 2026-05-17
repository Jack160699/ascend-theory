"use client";

import { DropClosingCta } from "./DropClosingCta";
import { DropDetails } from "./DropDetails";
import { DropHero } from "./DropHero";
import { DropNav } from "./DropNav";
import { DropScarcity } from "./DropScarcity";
import { DropStickyBar } from "./DropStickyBar";
import { DropStory } from "./DropStory";
import { DropVisuals } from "./DropVisuals";

export function DropExperience() {
  return (
    <div className="drop-canvas min-h-screen overflow-x-clip pb-24 antialiased">
      <DropNav />
      <DropHero />
      <DropStory />
      <DropVisuals />
      <DropDetails />
      <DropScarcity />
      <DropClosingCta />
      <DropStickyBar />
    </div>
  );
}
