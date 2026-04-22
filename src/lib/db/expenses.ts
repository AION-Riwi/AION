// src/lib/db/expenses.ts
import { supabase, supabaseRaw } from "./supabase";
import type { Expense } from "@/types/database";

export type ExpenseCategory =
  | "ingredientes"
  | "servicios"
  | "nomina"
  | "equipos"
  | "otros";

export interface ExpenseFormData {
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
}

export interface ExpenseFormErrors {
  description?: string;
  amount?: string;
  category?: string;
  date?: string;
}

/**
 * Registrar gasto
 */
export async function createExpense(
  formData: ExpenseFormData,
  restaurantId: string,
  userId?: string,
): Promise<Expense> {
  type ExpenseRow = {
    id: string;
    description: string;
    amount: number;
    category: ExpenseCategory;
    date: string;
    created_at: string;
  };

  const { data, error } = (await supabaseRaw
    .from("expenses")
    .insert({
      description: formData.description,
      amount: formData.amount,
      category: formData.category,
      date: formData.date,
      restaurant_id: restaurantId,
      user_id: userId ?? null,
    })
    .select()
    .single()) as {
    data: ExpenseRow | null;
    error: { message: string } | null;
  };

  if (error || !data) {
    throw new Error(
      `Error al registrar el gasto: ${error?.message ?? "sin datos"}`,
    );
  }

  return data as Expense;
}

/**
 * Obtener gastos por mes
 */
export async function getExpensesByMonth(
  year: number,
  month: number,
  restaurantId: string,
): Promise<Expense[]> {
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: false });

  if (error) {
    throw new Error(`Error al obtener gastos: ${error.message}`);
  }

  return (data ?? []) as Expense[];
}

/**
 * Calcular ganancia mensual:
 * ventas - costos - gastos
 */
export async function getMonthlyProfit(
  year: number,
  month: number,
  restaurantId: string,
): Promise<{
  totalSales: number;
  totalCosts: number;
  totalExpenses: number;
  profit: number;
}> {
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

  type SaleRow = { total: number };
  type ExpenseRow = { amount: number };
  type OrderRow = { id: string };
  type OrderItemRow = {
    quantity: number;
    menu_items: { cost_price: number | null } | null;
  };

  // 🔹 Ventas
  const { data: sales, error: salesError } = (await supabase
    .from("sales")
    .select("total")
    .eq("restaurant_id", restaurantId)
    .gte("created_at", from)
    .lte("created_at", to)) as {
    data: SaleRow[] | null;
    error: { message: string } | null;
  };

  if (salesError) {
    throw new Error(`Error al obtener ventas: ${salesError.message}`);
  }

  // 🔹 Gastos
  const { data: expenses, error: expensesError } = (await supabase
    .from("expenses")
    .select("amount")
    .eq("restaurant_id", restaurantId)
    .gte("date", from)
    .lte("date", to)) as {
    data: ExpenseRow[] | null;
    error: { message: string } | null;
  };

  if (expensesError) {
    throw new Error(`Error al obtener gastos: ${expensesError.message}`);
  }

  // 🔹 1. Obtener órdenes del mes
  const { data: orders, error: ordersError } = (await supabase
    .from("orders")
    .select("id")
    .gte("created_at", from)
    .lte("created_at", to)) as {
    data: OrderRow[] | null;
    error: { message: string } | null;
  };

  if (ordersError) {
    throw new Error(`Error al obtener órdenes: ${ordersError.message}`);
  }

  const orderIds = (orders ?? []).map((o) => o.id);

  // 🔹 2. Obtener items de esas órdenes
  const { data: orderItems, error: itemsError } = (await supabase
    .from("order_items")
    .select("quantity, menu_items(cost_price)")
    .in("order_id", orderIds)) as {
    data: OrderItemRow[] | null;
    error: { message: string } | null;
  };

  if (itemsError) {
    throw new Error(`Error al obtener costos: ${itemsError.message}`);
  }

  // 🔹 Cálculos
  const totalSales = (sales ?? []).reduce((sum, s) => sum + Number(s.total), 0);

  const totalExpenses = (expenses ?? []).reduce(
    (sum, e) => sum + Number(e.amount),
    0,
  );

  const totalCosts = (orderItems ?? []).reduce((sum, item) => {
    const cost = item.menu_items?.cost_price ?? 0;
    return sum + cost * item.quantity;
  }, 0);

  return {
    totalSales,
    totalCosts,
    totalExpenses,
    profit: totalSales - totalCosts - totalExpenses,
  };
}
