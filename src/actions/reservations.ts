"use server";

import { createReservation } from "@/lib/db/queries/reservations";
import { getAvailableTables } from "@/lib/db/queries/tables";
import type { CreateReservationInput } from "@/lib/db/queries/reservations";

export async function fetchAvailableTablesAction(
  restaurantId: string,
  date: string,
  time: string,
  partySize: number,
) {
  return getAvailableTables(restaurantId, date, time, partySize);
}

export async function createReservationAction(input: CreateReservationInput) {
  // ✅ Desestructurar explícitamente para no perder ningún campo
  const { user_id, table_id, date, time, party_size } = input;

  return createReservation(user_id, table_id, date, time, party_size);
}
