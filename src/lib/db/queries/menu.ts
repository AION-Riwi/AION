import { supabase } from "@/lib/db/supabase";
import type { MenuItem } from "@/types/database";

export async function getMenuItems(restaurantId: string): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("available", true)
    .order("category");

  if (error) throw new Error(`Error al obtener menú: ${error.message}`);
  return data;
}

export async function getMenuItemById(id: string): Promise<MenuItem> {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(`Error al obtener plato: ${error.message}`);
  return data;
}
