"use server";

import { getMenuItems } from "@/lib/db/queries/menu";
import type { MenuItem } from "@/types/database";

export async function fetchMenuAction(
  restaurantId: string,
): Promise<MenuItem[]> {
  if (!restaurantId) throw new Error("restaurantId es requerido");
  return getMenuItems(restaurantId);
}
