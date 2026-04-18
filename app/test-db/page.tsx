// Pruebas de funcionamiento de la conexión a la base de datos
import {
  fetchAvailableTablesAction,
  createReservationAction,
} from "@/actions/reservations";
import { fetchMenuAction } from "@/actions/menu";

export default async function TestDbPage() {
  const results: Record<string, unknown> = {};
  const errors: Record<string, string> = {};

  // TEST 1 — getMenuItems
  try {
    results.menu = await fetchMenuAction(
      "5f1398a6-4d96-4d4e-8dff-2488691c1ee5",
    );
  } catch (e) {
    errors.menu = e instanceof Error ? e.message : "Error desconocido";
  }

  // TEST 2 — getAvailableTables
  try {
    results.tables = await fetchAvailableTablesAction(
      "5f1398a6-4d96-4d4e-8dff-2488691c1ee5",
      "2025-06-01",
      "19:00:00",
      2,
    );
  } catch (e) {
    errors.tables = e instanceof Error ? e.message : "Error desconocido";
  }

  // TEST 3 — createReservation
  // Usamos la primera mesa disponible del test anterior
  const firstTable = Array.isArray(results.tables) ? results.tables[0] : null;

  try {
    if (!firstTable) throw new Error("No hay mesas disponibles para probar");

    results.reservation = await createReservationAction({
      user_id: "5aac57ce-7ce9-4299-891d-6b9bdc8612d8",
      table_id: firstTable.id,
      date: "2025-06-01",
      time: "19:00:00",
      party_size: 2,
    });
  } catch (e) {
    errors.reservation = e instanceof Error ? e.message : "Error desconocido";
  }

  return (
    <div style={{ padding: 32, fontFamily: "monospace" }}>
      <h1 style={{ fontSize: 20, marginBottom: 24 }}>
        AION — Test de conexión Supabase
      </h1>

      <TestBlock
        title="TEST 1 — getMenuItems()"
        data={results.menu}
        error={errors.menu}
        expect="Array con 5 platos"
      />

      <TestBlock
        title="TEST 2 — getAvailableTables()"
        data={results.tables}
        error={errors.tables}
        expect="Array con mesas disponibles para 2 personas el 2025-06-01 a las 19:00"
      />

      <TestBlock
        title="TEST 3 — createReservation()"
        data={results.reservation}
        error={errors.reservation}
        expect="Objeto Reservation con id, status: pending"
      />
    </div>
  );
}

function TestBlock({
  title,
  data,
  error,
  expect,
}: {
  title: string;
  data: unknown;
  error?: string;
  expect: string;
}) {
  const passed = !error && data !== undefined;
  return (
    <div
      style={{
        marginBottom: 32,
        borderLeft: `4px solid ${passed ? "green" : error ? "red" : "orange"}`,
        paddingLeft: 16,
      }}
    >
      <p style={{ fontWeight: "bold", margin: "0 0 4px" }}>{title}</p>
      <p style={{ color: "#888", fontSize: 12, margin: "0 0 8px" }}>
        Esperado: {expect}
      </p>
      {error ? (
        <p style={{ color: "red" }}>ERROR: {error}</p>
      ) : (
        <pre
          style={{
            fontSize: 11,
            background: "#f4f4f4",
            padding: 12,
            borderRadius: 6,
            overflow: "auto",
          }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
