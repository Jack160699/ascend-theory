/** Scroll runway per scene — shorter on mobile for calmer pacing. */
export type SceneScrollSpec = string | { desktop: string; mobile: string };

export function resolveSceneScrollHeight(
  spec: SceneScrollSpec,
  isMobile: boolean,
): string {
  if (typeof spec === "string") return spec;
  return isMobile ? spec.mobile : spec.desktop;
}

export const SCENE_SCROLL = {
  hero: { desktop: "140vh", mobile: "115vh" },
  storyLg: { desktop: "125vh", mobile: "98vh" },
  storyMd: { desktop: "115vh", mobile: "92vh" },
  storySm: { desktop: "108vh", mobile: "88vh" },
  transformation: { desktop: "100vh", mobile: "92vh" },
} as const satisfies Record<string, SceneScrollSpec>;
