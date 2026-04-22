import { supabase, supabaseRaw } from "./supabase";
import type { Table } from "@/types/database";
// Solo los campos que necesitamos mostrar al usuario
export type AvailableTable = Pick<Table, "id" | "number" | "capacity">;

export interface ReservationFormData {
  name: string;
  email: string;
  phone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  partySize: number;
  tableId: string;
}

export interface ReservationConfirmation {
  id: string;
  tableNumber: number;
  date: string;
  time: string;
  partySize: number;
}

export interface FormErrors {
  name?: string;
  email?: string;
  date?: string;
  time?: string;
  partySize?: string;
  tableId?: string;
}

/**
 * Devuelve mesas disponibles para una fecha, hora y número de personas
 */
export async function getAvailableTables(
  restaurantId: string,
  date: string,
  time: string,
  partySize: number,
): Promise<AvailableTable[]> {
  // 1. IDs de mesas ya reservadas en esa fecha/hora
  const { data: busyReservations, error: busyError } = await supabase
    .from("reservations")
    .select("table_id")
    .eq("date", date)
    .eq("time", time)
    .in("status", ["pending", "confirmed"]);

  if (busyError) {
    throw new Error(`Error buscando reservas existentes: ${busyError.message}`);
  }

  const busyIds: string[] = (busyReservations ?? []).map(
    (r: { table_id: string }) => r.table_id,
  );
  // 2. Mesas con capacidad suficiente y no ocupadas
  let query = supabase
    .from("tables")
    .select("id, number, capacity")
    .eq("restaurant_id", restaurantId)
    .eq("status", "available")
    .gte("capacity", partySize);

  if (busyIds.length > 0) {
    query = query.not("id", "in", `(${busyIds.join(",")})`);
  }

  const { data: tables, error: tablesError } = await query;

  if (tablesError) {
    throw new Error(`Error buscando mesas: ${tablesError.message}`);
  }

  return tables as AvailableTable[];
}

/**
 * Crea la reserva y devuelve los datos de confirmación
 */
export async function createReservation(
  formData: ReservationFormData,
  userId: string,
): Promise<ReservationConfirmation> {
  type ReservationRow = {
    id: string;
    date: string;
    time: string;
    party_size: number;
  };

  type TableRow = {
    number: number;
  };

  // Paso 1: crear la reserva (usando cliente sin tipos para evitar conflicto)
  const reservationQuery = supabaseRaw
    .from("reservations")
    .insert({
      user_id: userId,
      table_id: formData.tableId,
      date: formData.date,
      time: formData.time,
      party_size: formData.partySize,
      status: "pending",
    })
    .select("id, date, time, party_size")
    .single();

  const { data: reservationData, error: reservationError } =
    (await reservationQuery) as {
      data: ReservationRow | null;
      error: { message: string } | null;
    };
  if (reservationError || !reservationData) {
    throw new Error(
      `Error al crear la reserva: ${reservationError?.message ?? "sin datos"}`,
    );
  }

  // Paso 2: obtener número de mesa
  const tableQuery = supabase
    .from("tables")
    .select("number")
    .eq("id", formData.tableId)
    .single();

  const { data: tableData, error: tableError } = (await tableQuery) as {
    data: TableRow | null;
    error: { message: string } | null;
  };

  if (tableError || !tableData) {
    throw new Error(
      `Error al obtener la mesa: ${tableError?.message ?? "sin datos"}`,
    );
  }

  return {
    id: reservationData.id,
    tableNumber: tableData.number,
    date: reservationData.date,
    time: reservationData.time,
    partySize: reservationData.party_size,
  };
}
