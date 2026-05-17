/** @deprecated Import from `@/lib/data/drops` */
export { getFeaturedDrop as DROP_PRODUCT_LEGACY } from "@/lib/data/drops";

import { getFeaturedDrop } from "@/lib/data/drops";

/** @deprecated Use `Drop` from `@/lib/data/drops` */
export type DropProduct = ReturnType<typeof getFeaturedDrop>;

/** @deprecated Use `getFeaturedDrop()` or `getDropBySlug()` */
export const DROP_PRODUCT = getFeaturedDrop();
