import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import prisma from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_secret_key_change_me",
);

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    // 1. Validar campos
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 },
      );
    }

    // 2. Verificar si el usuario ya existe
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El correo electrónico ya está registrado" },
        { status: 400 },
      );
    }

    // 3. Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Crear usuario en la base de datos
    const user = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "customer", // Rol por defecto
      },
    });

    // 5. Generar JWT
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);
    // 6. Retornar respuesta exitosa (eliminamos el password manualmente para evitar el warning de variable no usada)
    const userWithoutPassword = { ...user } as Partial<typeof user>;
    delete userWithoutPassword.password;
    return NextResponse.json(
      {
        message: "Usuario registrado con éxito",
        user: userWithoutPassword,
        token,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Error en registro:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";

    return NextResponse.json(
      { error: "Error interno del servidor", details: errorMessage },
      { status: 500 },
    );
  }
}
