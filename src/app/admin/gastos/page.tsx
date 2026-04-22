"use client";

import { useState, useEffect, useCallback, ChangeEvent } from "react";
import {
  createExpense,
  getExpensesByMonth,
  getMonthlyProfit,
  type ExpenseFormData,
  type ExpenseCategory,
} from "@/lib/db/expenses";
import type { Expense } from "@/types/database";

const CATEGORIES: ExpenseCategory[] = [
  "ingredientes",
  "servicios",
  "nomina",
  "equipos",
  "otros",
];

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// ⚠️ Reemplaza con el UUID real de tu restaurante en Supabase
const RESTAURANT_ID = "pon-aqui-el-uuid-del-restaurante";

export default function GastosPage() {
  const now = new Date();

  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  const [form, setForm] = useState<ExpenseFormData>({
    description: "",
    amount: 0,
    category: "otros",
    date: now.toISOString().split("T")[0],
  });

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [profit, setProfit] = useState<{
    totalSales: number;
    totalCosts: number;
    totalExpenses: number;
    profit: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setSubmitError(null);

    try {
      const [expensesData, profitData] = await Promise.all([
        getExpensesByMonth(selectedYear, selectedMonth, RESTAURANT_ID),
        getMonthlyProfit(selectedYear, selectedMonth, RESTAURANT_ID),
      ]);
      setExpenses(expensesData);
      setProfit(profitData);
    } catch (err) {
      if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Error desconocido al cargar datos");
      }
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number(value) : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      await createExpense(form, RESTAURANT_ID);
      setSuccessMessage("Gasto registrado correctamente");
      setForm({
        description: "",
        amount: 0,
        category: "otros",
        date: now.toISOString().split("T")[0],
      });
      await loadData();
    } catch (err) {
      if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Error desconocido al registrar el gasto");
      }
    }
  }

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Gastos</h1>

      {/* Selector de mes y año */}
      <div className="flex gap-2">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          {[2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Formulario */}
      <section className="bg-white border rounded-xl p-6 space-y-3">
        <h2 className="text-lg font-semibold text-gray-700">Nuevo gasto</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Descripción"
            className="border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div className="grid grid-cols-3 gap-3">
            <input
              name="amount"
              type="number"
              value={form.amount}
              onChange={handleChange}
              min={0}
              step={0.01}
              placeholder="Monto"
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {submitError && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
              {submitError}
            </p>
          )}
          {successMessage && (
            <p className="text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg p-3">
              {successMessage}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition"
          >
            Guardar gasto
          </button>
        </form>
      </section>

      {/* Reporte mensual */}
      {profit && (
        <section className="bg-white border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Reporte de {MONTHS[selectedMonth - 1]} {selectedYear}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Ventas totales</p>
              <p className="text-xl font-bold text-green-700">
                ${profit.totalSales.toFixed(2)}
              </p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Costo de productos</p>
              <p className="text-xl font-bold text-red-600">
                ${profit.totalCosts.toFixed(2)}
              </p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Gastos operativos</p>
              <p className="text-xl font-bold text-orange-600">
                ${profit.totalExpenses.toFixed(2)}
              </p>
            </div>
            <div
              className={`border rounded-lg p-4 ${profit.profit >= 0 ? "bg-blue-50 border-blue-200" : "bg-red-50 border-red-200"}`}
            >
              <p className="text-xs text-gray-500 mb-1">Ganancia real</p>
              <p
                className={`text-xl font-bold ${profit.profit >= 0 ? "text-blue-700" : "text-red-700"}`}
              >
                ${profit.profit.toFixed(2)}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Lista de gastos */}
      <section className="bg-white border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Gastos del mes
        </h2>
        {loading ? (
          <p className="text-sm text-gray-500">Cargando...</p>
        ) : expenses.length === 0 ? (
          <p className="text-sm text-gray-500">
            No hay gastos registrados este mes.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Fecha</th>
                <th className="pb-2">Descripción</th>
                <th className="pb-2">Categoría</th>
                <th className="pb-2 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b last:border-0">
                  <td className="py-2 text-gray-500">{expense.date}</td>
                  <td className="py-2">{expense.description}</td>
                  <td className="py-2 capitalize text-gray-600">
                    {expense.category}
                  </td>
                  <td className="py-2 text-right font-medium">
                    ${Number(expense.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
