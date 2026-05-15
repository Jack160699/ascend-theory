/** Figma WORLD SYSTEM scroll runways (exact desktop; slightly shorter on mobile). */
export type SceneScrollSpec = { desktop: string; mobile: string };

export const FIGMA_SCENE_SCROLL = {
  hero: { desktop: "150vh", mobile: "112vh" },
  story130: { desktop: "130vh", mobile: "108vh" },
  story120: { desktop: "120vh", mobile: "102vh" },
  story135: { desktop: "135vh", mobile: "110vh" },
  story125: { desktop: "125vh", mobile: "106vh" },
  transformation: { desktop: "100vh", mobile: "100svh" },
} as const satisfies Record<string, SceneScrollSpec>;

export function sceneScrollHeight(
  spec: SceneScrollSpec,
  isMobile: boolean,
): string {
  return isMobile ? spec.mobile : spec.desktop;
}
