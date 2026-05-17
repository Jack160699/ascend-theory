/**
 * Ascend Theory — unified stock media (Unsplash stills, Pexels/Coverr video).
 * Dark luxury · cinematic · minimal. Optimized via next/image remote loader.
 */

/** Unsplash photo id, e.g. `photo-1514565130933-ff0f825377de` */
export function stockPhoto(photoId: string, width = 2400): string {
  const id = photoId.startsWith("photo-") ? photoId : `photo-${photoId}`;
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;
}

/** Curated IDs — moody, neutral, fashion / urban / performance */
const PHOTO = {
  cityNightHero: "photo-1514565130933-ff0f825377de",
  architectureTwilight: "photo-1486406146926-c627a92ad1ab",
  restaurantMoody: "photo-1414235077428-338989a2e8d0",
  fashionStudioDark: "photo-1556905054-24bf8fbf6460",
  golfDusk: "photo-1592919670787-64ace577ec67",
  travelWindow: "photo-1436491865332-7a61a109cc05",
  oceanDark: "photo-1505142468610-359e7caed608",
  interiorArchitectural: "photo-1610899632923-3751bc4b427a",
  transitMomentum: "photo-1633070374521-b45f91ea5cec",
  coastalWalk: "photo-1590501949668-2442efd4d3d7",
  golfEnvironment: "photo-1599718100450-8c59eed42a40",
  studioStructured: "photo-1738748444676-113d30c9a25b",
  systemsArchitecture: "photo-1699766868222-56056eb963ab",
  diningBrotherhood: "photo-1771408662069-7a78b1942801",
  suitUrbanNight: "photo-1507003211169-0a1dd7228f2d",
  minimalFashion: "photo-1483985988352-763728e3685b",
} as const;

export const STOCK_IMAGES = {
  heroStorefront: stockPhoto(PHOTO.cityNightHero),
  editorialArchitecture: stockPhoto(PHOTO.architectureTwilight),
  brotherhoodDining: stockPhoto(PHOTO.restaurantMoody),
  teamStudio: stockPhoto(PHOTO.fashionStudioDark),
  lifestyleGolf: stockPhoto(PHOTO.golfDusk),
  lifestyleAirport: stockPhoto(PHOTO.travelWindow),
  lifestyleCoastal: stockPhoto(PHOTO.oceanDark),
} as const;

export type StockImageKey = keyof typeof STOCK_IMAGES;

/** Hero loop — lightweight HD; poster falls back to hero still */
export const STOCK_HERO_VIDEO = {
  webm:
    "https://storage.coverr.co/videos/coverr-walking-in-the-city-at-night-5901/1080p.webm",
  mp4: "https://videos.pexels.com/video-files/3191797/3191797-hd_1920_1080_25fps.mp4",
  poster: STOCK_IMAGES.heroStorefront,
} as const;

export const WORLD_STOCK_IMAGES = {
  hero: stockPhoto(PHOTO.interiorArchitectural, 1920),
  momentum: stockPhoto(PHOTO.transitMomentum, 1920),
  distraction: stockPhoto(PHOTO.coastalWalk, 1920),
  environment: stockPhoto(PHOTO.golfEnvironment, 1920),
  solution: stockPhoto(PHOTO.studioStructured, 1920),
  howItWorks: stockPhoto(PHOTO.systemsArchitecture, 1920),
  brotherhood: stockPhoto(PHOTO.diningBrotherhood, 1920),
} as const;
