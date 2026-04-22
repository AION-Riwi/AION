// test mongo

import { NextResponse } from "next/server";
import { logAIInteraction } from "@/lib/ai/log";

export async function GET() {
  await logAIInteraction({
    type: "input",
    input: "Hola desde test",
  });

  return NextResponse.json({ ok: true });
}
