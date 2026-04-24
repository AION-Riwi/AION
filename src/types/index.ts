type userRole = "customer" | "staff" | "admin";

export interface users {
  readonly id: PropertyKey;
  readonly email: string;
  name: string;
  password?: string;
  role: userRole;
  locationName?: string;
  position?: string;
  reservations: unknown[];
  rewards: unknown[];
  user_levels: unknown | null;
  created_at: Date;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: userRole;
  locationName?: string;
  position?: string;
}
export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  role?: userRole;
  locationName?: string;
  position?: string;
}
