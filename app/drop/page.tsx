import { BRAND_ROUTES } from "@/lib/brand/routes";
import { redirect } from "next/navigation";

export default function DropIndexPage() {
  redirect(BRAND_ROUTES.drops);
}
