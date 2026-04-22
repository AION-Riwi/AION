export type UserRole = "customer" | "staff" | "admin";
export type TableStatus = "available" | "occupied" | "reserved";
export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";
export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";
export type PaymentMethod = "cash" | "card" | "transfer";
export type UserLevel = "explorer" | "adventurer" | "gourmet" | "master";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  created_at: string;
}

export interface Table {
  id: string;
  restaurant_id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  qr_code: string | null;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  available: boolean;
  cost_price: number | null;
  stock: number;
  min_stock: number;
  is_secret: boolean;
  image_url: string | null;
}

export interface Reservation {
  id: string;
  user_id: string;
  table_id: string;
  date: string;
  time: string;
  party_size: number;
  status: ReservationStatus;
  created_at: string;
}

export interface Order {
  id: string;
  reservation_id: string | null;
  table_id: string | null;
  status: OrderStatus;
  total: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, "id" | "created_at">;
        Update: Partial<Omit<User, "id" | "created_at">>;
      };
      restaurants: {
        Row: Restaurant;
        Insert: Omit<Restaurant, "id" | "created_at">;
        Update: Partial<Omit<Restaurant, "id" | "created_at">>;
      };
      tables: {
        Row: Table;
        Insert: Omit<Table, "id">;
        Update: Partial<Omit<Table, "id">>;
      };
      menu_items: {
        Row: MenuItem;
        Insert: Omit<MenuItem, "id">;
        Update: Partial<Omit<MenuItem, "id">>;
      };
      reservations: {
        Row: Reservation;
        Insert: Omit<Reservation, "id" | "created_at">;
        Update: Partial<Omit<Reservation, "id" | "created_at">>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, "id" | "created_at">;
        Update: Partial<Omit<Order, "id" | "created_at">>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, "id">;
        Update: Partial<Omit<OrderItem, "id">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
