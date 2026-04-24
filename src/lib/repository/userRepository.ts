import { prisma } from "@/lib/prisma";
import { users as PrismaUser } from "@prisma/client";
import type { users, CreateUserInput, UpdateUserInput } from "@/types/index";
import { bcryptPasswordService } from "@/lib/services/bcryptPasswordService";
import {
  handleNotFoundError,
  handleDuplicateError,
} from "../errors/errorHandlers";
import { logger } from "@/lib/logger";

// here we define the SafeUser type which is the same as User but without authentication fields
export type SafeUser = Omit<users, "password">;

// we extend the user interface to recognize authentication fields and then remove them

function mapToUserInternal(data: PrismaUser): users {
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    password: data.password || undefined,
    role: data.role as users["role"],
    locationName: data.locationName || undefined,
    position: data.position || undefined,
    created_at: data.created_at,
    reservations: [],
    rewards: [],
    refresh_tokens: [],
    user_levels: undefined,
  } as users;
}

//We remove sensitive data like password, emailCode and emailCodeExpires with destructuring
export function mapToSafeUser(data: PrismaUser): SafeUser {
  const { password, ...userWithoutPassword } = mapToUserInternal(data);
  return userWithoutPassword;
}

export async function findByEmail(
  email: string,
  forAuth?: boolean,
): Promise<users | SafeUser | null> {
  logger.debug(`User lookup`, { method: "findByEmail", email });
  const user = await prisma.users.findUnique({
    where: { email },
  });
  if (!user) return null;

  //ternary to return the user with or without password data
  return forAuth ? mapToUserInternal(user) : mapToSafeUser(user);
}

export async function findById(
  id: string,
  forAuth?: boolean,
): Promise<users | SafeUser | null> {
  logger.debug(`User lookup`, { method: "findById", id });
  const user = await prisma.users.findUnique({
    where: { id },
  });
  if (!user) return null;

  //ternary to return the user with or without authentication data
  return forAuth ? mapToUserInternal(user) : mapToSafeUser(user);
}

//we create a new user with password hash
export async function create(data: CreateUserInput): Promise<SafeUser> {
  const hashedPassword = await bcryptPasswordService.hash(data.password);

  const newUser = await handleDuplicateError(
    prisma.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          ...(data.role && { role: data.role }),
        },
      });

      await tx.user_levels.create({
        data: { user_id: user.id }, // level "explorer" by default
      });

      return user;
    }),
    data.email,
  );

  logger.info(`User created`, {
    userId: newUser.id,
    email: newUser.email,
    role: newUser.role,
  });
  return mapToSafeUser(newUser);
}

export async function update(
  id: string,
  data: UpdateUserInput,
): Promise<SafeUser> {
  const { password, role, name, email, locationName, position } = data;
  const updateUser = await handleNotFoundError(
    prisma.users.update({
      where: { id },
      data: {
        //Used to say "If this is true, do the following".
        ...(name && { name }),
        ...(password && {
          password: await bcryptPasswordService.hash(password),
        }),
        ...(email && { email }),
        ...(role && { role }),
        ...(locationName && { locationName }),
        ...(position && { position }),
      },
    }),
    id,
  );

  logger.info(`User updated`, { userId: id, updatedFields: Object.keys(data) });
  return mapToSafeUser(updateUser);
}

export async function deleteById(id: string): Promise<SafeUser | null> {
  // We delete using handleNotFoundError to validate
  const deletedUser = await handleNotFoundError(
    prisma.users.delete({
      where: { id },
    }),
    id,
  );

  logger.info(`User deleted`, {
    userId: deletedUser.id,
    email: deletedUser.email,
  });
  return mapToSafeUser(deletedUser);
}
