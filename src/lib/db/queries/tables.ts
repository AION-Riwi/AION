import { supabase } from "@/lib/db/supabase";
import type { Table } from "@/types/database";

export async function getAvailableTables(
  restaurantId: string,
  date: string,
  time: string,
  partySize: number,
): Promise<Table[]> {
  // Primero traemos las mesas con capacidad suficiente
  const { data: allTables, error: tablesError } = await supabase
    .from("tables")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .gte("capacity", partySize)
    .eq("status", "available");

  if (tablesError)
    throw new Error(`Error al obtener mesas: ${tablesError.message}`);

  // Excluimos las que ya tienen reserva en ese fecha/hora
  const { data: reservedTableIds, error: reservationsError } = await supabase
    .from("reservations")
    .select("table_id")
    .eq("date", date)
    .eq("time", time)
    .in("status", ["pending", "confirmed"]);

  if (reservationsError)
    throw new Error(
      `Error al verificar reservas: ${reservationsError.message}`,
    );

  const occupiedIds = new Set(reservedTableIds.map((r) => r.table_id));

  return allTables.filter((table) => !occupiedIds.has(table.id));
}

export async function getTableById(id: string): Promise<Table> {
  const { data, error } = await supabase
    .from("tables")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(`Error al obtener mesa: ${error.message}`);
  return data;
}
