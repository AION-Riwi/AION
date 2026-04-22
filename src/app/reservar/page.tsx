"use client";

import { useState } from "react";
import {
  getAvailableTables,
  createReservation,
  type AvailableTable,
  type ReservationFormData,
  type ReservationConfirmation,
  type FormErrors,
} from "@/lib/db/reservations";

//  Reemplaza con el UUID real de tu restaurante en Supabase
const RESTAURANT_ID = "pon-aqui-el-uuid-del-restaurante";
// Reemplaza con el user.id de la sesión cuando tengas auth
const MOCK_USER_ID = "pon-aqui-un-uuid-de-usuario";

// --- Validación del formulario ---
function validateForm(form: ReservationFormData): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) {
    errors.name = "El nombre es requerido";
  }

  if (!form.email.trim()) {
    errors.email = "El email es requerido";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Email inválido";
  }

  if (!form.date) {
    errors.date = "La fecha es requerida";
  } else if (new Date(form.date) < new Date(new Date().toDateString())) {
    errors.date = "La fecha no puede ser en el pasado";
  }

  if (!form.time) {
    errors.time = "La hora es requerida";
  }

  if (form.partySize < 1) {
    errors.partySize = "Mínimo 1 persona";
  } else if (form.partySize > 20) {
    errors.partySize = "Máximo 20 personas";
  }

  return errors;
}

// --- Página principal ---
export default function ReservarPage() {
  const [form, setForm] = useState<ReservationFormData>({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    partySize: 1,
    tableId: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [availableTables, setAvailableTables] = useState<AvailableTable[]>([]);
  const [tablesSearched, setTablesSearched] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmation, setConfirmation] =
    useState<ReservationConfirmation | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "partySize" ? Number(value) : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSearchTables() {
    const searchErrors: FormErrors = {};
    if (!form.date) searchErrors.date = "Ingresa una fecha";
    if (!form.time) searchErrors.time = "Ingresa una hora";
    if (form.partySize < 1) searchErrors.partySize = "Mínimo 1 persona";

    if (Object.keys(searchErrors).length > 0) {
      setErrors(searchErrors);
      return;
    }

    setLoadingTables(true);
    setTablesSearched(false);
    setAvailableTables([]);
    setForm((prev) => ({ ...prev, tableId: "" }));
    setSubmitError(null);

    try {
      const tables = await getAvailableTables(
        RESTAURANT_ID,
        form.date,
        form.time,
        form.partySize,
      );
      setAvailableTables(tables);
      setTablesSearched(true);
    } catch (err) {
      if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Error desconocido al buscar mesas");
      }
    } finally {
      setLoadingTables(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const validationErrors = validateForm(form);
    if (!form.tableId) validationErrors.tableId = "Selecciona una mesa";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoadingSubmit(true);

    try {
      const result = await createReservation(form, MOCK_USER_ID);
      setConfirmation(result);
    } catch (err) {
      if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Error desconocido al crear la reserva");
      }
    } finally {
      setLoadingSubmit(false);
    }
  }

  // --- Pantalla de confirmación ---
  if (confirmation) {
    return (
      <main className="max-w-md mx-auto mt-16 p-6 bg-green-50 border border-green-300 rounded-xl text-center">
        <h1 className="text-2xl font-bold text-green-700 mb-2">
          ¡Reserva confirmada! 🎉
        </h1>
        <p className="text-gray-600 mb-4">Tu número de reserva es:</p>
        <p className="text-3xl font-mono font-bold text-green-800 bg-white border border-green-300 rounded-lg py-3 px-6 inline-block mb-4">
          {confirmation.id.slice(0, 8).toUpperCase()}
        </p>
        <div className="text-gray-700 space-y-1 text-sm">
          <p>
            📅 <strong>{confirmation.date}</strong> a las{" "}
            <strong>{confirmation.time}</strong>
          </p>
          <p>
            👥 <strong>{confirmation.partySize}</strong> personas
          </p>
          <p>
            🪑 Mesa número <strong>{confirmation.tableNumber}</strong>
          </p>
        </div>
        <button
          onClick={() => {
            setConfirmation(null);
            setForm({
              name: "",
              email: "",
              phone: "",
              date: "",
              time: "",
              partySize: 1,
              tableId: "",
            });
            setAvailableTables([]);
            setTablesSearched(false);
          }}
          className="mt-6 text-sm text-green-700 underline"
        >
          Hacer otra reserva
        </button>
      </main>
    );
  }

  // --- Formulario ---
  return (
    <main className="max-w-lg mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Reservar una mesa
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre completo
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ana García"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="ana@email.com"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+57 300 000 0000"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Fecha / Hora / Personas */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              className="w-full border rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.date && (
              <p className="text-red-500 text-xs mt-1">{errors.date}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora
            </label>
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              className="w-full border rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.time && (
              <p className="text-red-500 text-xs mt-1">{errors.time}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Personas
            </label>
            <input
              type="number"
              name="partySize"
              value={form.partySize}
              onChange={handleChange}
              min={1}
              max={20}
              className="w-full border rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.partySize && (
              <p className="text-red-500 text-xs mt-1">{errors.partySize}</p>
            )}
          </div>
        </div>

        {/* Buscar mesas */}
        <button
          type="button"
          onClick={handleSearchTables}
          disabled={loadingTables}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 rounded-lg text-sm transition disabled:opacity-50"
        >
          {loadingTables ? "Buscando mesas..." : "🔍 Ver mesas disponibles"}
        </button>

        {/* Resultados de mesas */}
        {tablesSearched && (
          <div>
            {availableTables.length === 0 ? (
              <p className="text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-lg p-3">
                No hay mesas disponibles para esa fecha, hora y número de
                personas.
              </p>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecciona una mesa
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availableTables.map((table) => (
                    <button
                      key={table.id}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, tableId: table.id }))
                      }
                      className={`border rounded-lg p-3 text-sm text-left transition ${
                        form.tableId === table.id
                          ? "border-blue-500 bg-blue-50 font-semibold"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      🪑 Mesa #{table.number}
                      <span className="block text-gray-500 text-xs">
                        Capacidad: {table.capacity} personas
                      </span>
                    </button>
                  ))}
                </div>
                {errors.tableId && (
                  <p className="text-red-500 text-xs mt-1">{errors.tableId}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error general */}
        {submitError && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
            {submitError}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loadingSubmit || !form.tableId}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingSubmit ? "Guardando reserva..." : "Confirmar reserva"}
        </button>
      </form>
    </main>
  );
}
