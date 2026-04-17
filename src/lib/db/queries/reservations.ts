import { supabase } from "@/lib/db/supabase";
import type { Reservation } from "@/types/database";

export type CreateReservationInput = {
  user_id: string;
  table_id: string;
  date: string;
  time: string;
  party_size: number;
};

export async function createReservation(
  userId: string,
  tableId: string,
  date: string,
  time: string,
  partySize: number,
): Promise<Reservation> {
  // Normalizar time por si llega sin segundos
  const normalizedTime = time.length === 5 ? `${time}:00` : time;

  const { data, error } = await supabase
    .from("reservations")
    .insert({
      user_id: userId,
      table_id: tableId,
      date,
      time: normalizedTime,
      party_size: partySize,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw new Error(`Error al crear reservación: ${error.message}`);
  return data;
}

export async function getReservationById(id: string): Promise<Reservation> {
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(`Error al obtener reserva: ${error.message}`);
  return data;
}

export async function getReservationsByUser(
  userId: string,
): Promise<Reservation[]> {
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) throw new Error(`Error al obtener reservas: ${error.message}`);
  return data;
}
