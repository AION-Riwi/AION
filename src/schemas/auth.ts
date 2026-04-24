import { z } from "zod";

/**
 * Reusable base schema for password validation
 * Extracted from bcryptPasswordService for consistency
 */
const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[0-9]/, "Password must include at least one number")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/[a-z]/, "Password must include at least one lowercase letter")
  .regex(
    /[!@#$%^&*(),.?":{}|<>]/,
    "Password must include at least one special character",
  );

/**
 * Schema for normal user registration (customers)
 * Role is always "customer" - cannot be chosen
 */
export const CustomerRegisterSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name cannot exceed 100 characters"),
  email: z.string().email("Invalid email address"),
  password: PasswordSchema,
  // Fixed role to customer - default security
});

/**
 * Schema for employee registration (staff)
 * Includes workplace location and position
 */
export const StaffRegisterSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name cannot exceed 100 characters"),
  email: z.string().email("Invalid email address"),
  password: PasswordSchema,
  locationName: z
    .string()
    .min(2, "Location name is required")
    .max(100, "Location name cannot exceed 100 characters"),
  position: z
    .string()
    .min(2, "Position is required")
    .max(50, "Position cannot exceed 50 characters"),
  // Fixed role to staff - employees only
});

/**
 * Schema for administrator registration
 * Includes workplace location but not position
 */
export const AdminRegisterSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name cannot exceed 100 characters"),
  email: z.string().email("Invalid email address"),
  password: PasswordSchema,
  locationName: z
    .string()
    .min(2, "Location name is required")
    .max(100, "Location name cannot exceed 100 characters"),
  // Fixed role to admin - administrators only
});

/**
 * Types automatically inferred by Zod
 */
export type CustomerRegisterInput = z.infer<typeof CustomerRegisterSchema>;
export type StaffRegisterInput = z.infer<typeof StaffRegisterSchema>;
export type AdminRegisterInput = z.infer<typeof AdminRegisterSchema>;

/**
 * Unified type for the UseCase
 */
export type RegisterInput =
  | CustomerRegisterInput
  | StaffRegisterInput
  | AdminRegisterInput;
